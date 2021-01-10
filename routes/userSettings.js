const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth');
const UserSetting = require('../models/userSetting');
const User = require('../models/user');
const _ = require('lodash');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

router.post('/', [auth],async(req, res)=> {
    const user = await User.findOne({email: req.user.email});
    if (!user) {
        return res.status(401).json({ok: false, message: 'Sorry, you are not allowed to access this page'});
    }
    if (!req.body) {
        return res.status(400).json({ok: false, message: 'Bad request'});
    }
    let setting = new UserSetting(_.pick(req.body, ["name", "type", "value_int", "value_str"]));
    setting.user_id = user.id;
    await setting.save();
    res.status(200).json({ok: true, message: "Inserted"});
});

router.get('/', [auth], async(req, res)=> {
    const user = await User.findOne({email: req.user.email});
    if (!user) {
        return res.status(401).json({ok: false, message: 'Sorry, you are not allowed to access this page'});
    }
    const result = await UserSetting.findOne({user_id: user.id});
    res.status(200).json({ok: true, message: "", settings: result});
});

router.get('/totp/generate', async(req, res)=> {
    const secret = speakeasy.generateSecret({
        name: "keeper"
    });
    let qrcode_img = await qrcode.toDataURL(secret.otpauth_url);
    res.status(200).json({ok: true, message: "Success", qrcode: qrcode_img, base32secret: secret.base32});
});

router.post('/totp/verify', [auth], async(req, res)=> {
    console.log(req.body);
    const user = await User.findOne({email: req.user.email});
    if (!user) {
        return res.status(401).json({ok: false, message: 'Sorry, you are not allowed to access this page'});
    }
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
    res.status(200).json({ok: true, message: "Success"});
});

router.delete('/totp/:setting', [auth], async (req, res)=> {
    const user = await User.findOne({email: req.user.email});
    if (!user) {
        return res.status(401).json({ok: false, message: 'Sorry, you are not allowed to access this page'});
    }
    const result = await UserSetting.delete(req.params.setting);
    res.status(200).json({ok: true, message: 'unset', result: result});
});
module.exports = router;