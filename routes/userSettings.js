const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth');
const UserSetting = require('../models/userSetting');
const User = require('../models/user');
const _ = require('lodash');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const UserSettings = require('../models/userSetting');

router.post('/', [auth],async(req, res)=> {
    const user = req.user;
    if (!req.body) {
        return res.status(400).json({ok: false, message: 'Bad request'});
    }
    let setting = new UserSetting(_.pick(req.body, ["name", "type", "value_int", "value_str"]));
    setting.user_id = user.id;
    await setting.save();
    res.status(200).json({ok: true, message: "Inserted"});
});

router.get('/', [auth], async(req, res)=> {
    const user = req.user;
    const result = await UserSetting.findOne({user_id: user.id});
    res.status(200).json({ok: true, message: "", settings: result});
});

router.get('/2fa/generate', async(req, res)=> {
    const secret = speakeasy.generateSecret({
        name: "keeper"
    });
    let qrcode_img = await qrcode.toDataURL(secret.otpauth_url);
    res.status(200).json({ok: true, message: "Success", qrcode: qrcode_img, base32secret: secret.base32});
});

router.post('/2fa/verify', [auth], async(req, res)=> {
    const user = req.user;
    if (!req.body) {
        return res.status(400).json({ok: false, message: 'Bad request'});
    }
    let verified = speakeasy.totp.verify({ secret: req.body.value_str,
        encoding: 'base32',
        token: req.body.userToken });

    if (!verified) {
        return res.status(403).json({ok: false, message: "Syncronization failed"});
    }
    // save base32 secret in db & send qrcode, currently we are storing secret in plain text (bad practice)
    let setting = new UserSetting(_.pick(req.body, ["name", "type", "value_int", "value_str"]));
    setting.user_id = user.id;
    await setting.save();
    let maxAge = 60*60;
    let token = new User(user).generateAuthToken(true);
    res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge});
    res.status(200).json({ok: true, message: "Success"});
});

router.get('/2fa/authenticate', async(req, res, next)=>{await auth(req, res, next, true)}, (req, res)=> {
    res.status(206).render('2fa');
});
router.post('/2fa/authenticate', async(req, res, next)=>{await auth(req, res, next, true)}, async(req, res)=> {
    const user = req.user;
    const secret = (await UserSetting.findOne({user_id: user.id, name: "2fa"}))[0];
    if (!req.body) {
        return res.status(400).json({ok: false, message: 'Bad request'});
    }
    let verified = speakeasy.totp.verify({ secret: secret.value_str,
        encoding: 'base32',
        token: req.body.userToken });

    if (!verified) {
        return res.status(403).render("2fa", {err: "Syncronization failed"});
    }
    let maxAge = 60*60;
    let token = new User(user).generateAuthToken(true);
    res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge});
    res.status(200).redirect('../../users/me');
});

router.delete('/2fa/:setting', [auth], async (req, res)=> {
    const user = req.user;
    let result = await UserSettings.findOne({name: req.params.setting, user_id: user.id});
    if (!result[0]) {
        return res.status(400).json({ok: false, message: '2fa has not activated'});
    }
    await UserSetting.delete({name: req.params.setting, user_id: user.id});
    res.status(200).json({ok: true, message: 'Unset', result: result});
});
module.exports = router;

