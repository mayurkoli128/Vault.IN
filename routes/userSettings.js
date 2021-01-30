const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth');
const UserSetting = require('../models/userSetting');
const User = require('../models/user');
const _ = require('lodash');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const UserSettings = require('../models/userSetting');

// @type    POST
// @route   /api/settings/
// @desc    route for user to store setting 
// @access  PRIVATE 
router.post('/', [auth], async(req, res)=> {
    const user = req.user;
    if (!req.body) {
        return res.status(400).json({ok: false, message: 'Bad request'});
    }
    let setting = new UserSetting(_.pick(req.body, ["name", "type", "valueInt", "valueStr"]));
    setting.userId = user.id;
    await setting.save();
    res.status(200).json({ok: true, message: "Inserted"});
});

// @type    GTE
// @route   /api/settings/
// @desc    route for user to get all his/her settings
// @access  PRIVATE 
router.get('/', [auth], async(req, res)=> {
    const user = req.user;
    const result = await UserSetting.find({userId: user.id});
    res.status(200).json({ok: true, message: "", settings: result});
});

// @type    GET
// @route   /api/settings/2fa/generate
// @desc    route for user to get secrets & qrcode for activation of 2fa
// @access  PRIVATE 
router.get('/2fa/generate', [auth], async(req, res)=> {
    const secret = speakeasy.generateSecret({
        name: "Vault.IN"
    });
    let qrcode_img = await qrcode.toDataURL(secret.otpauth_url);
    res.status(200).json({ok: true, message: "Success", qrcode: qrcode_img, base32secret: secret.base32});
});

// @type    POST
// @route   /api/settings/2fa/verify
// @desc    route for user to verify provided token value
// @access  PRIVATE 
router.post('/2fa/verify', [auth], async(req, res)=> {
    const user = req.user;
    if (!req.body) {
        return res.status(400).json({ok: false, message: 'Bad request'});
    }
    let verified = speakeasy.totp.verify({ secret: req.body.valueStr,
        encoding: 'base32',
        token: req.body.userToken });

    if (!verified) {
        return res.status(403).json({ok: false, message: "Syncronization failed"});
    }
    // save base32 secret in db & send qrcode, currently we are storing secret in plain text (bad practice)
    let setting = new UserSetting(_.pick(req.body, ["name", "type", "valueInt", "valueStr"]));
    setting.userId = user.id;
    await setting.save();
    let maxAge = 60*60;
    let token = new User(user).generateAuthToken(true);
    res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge});
    res.status(200).json({ok: true, message: "Success"});
});

// @type    GET
// @route   /api/settings/2fa/authenticate
// @desc    route for user to authenticate provided token value
// @access  PRIVATE 
router.get('/2fa/authenticate', async(req, res, next)=>{await auth(req, res, next, true)}, (req, res)=> {
    res.status(206).render('2fa');
});

// @type    POST
// @route   /api/settings/2fa/authenticate
// @desc    route for user to authenticate provided token value
// @access  PRIVATE 
router.post('/2fa/authenticate', async(req, res, next)=>{await auth(req, res, next, true)}, async(req, res)=> {
    const user = req.user;
    const secret = (await UserSetting.find({userId: user.id, name: "2fa"}))[0];
    if (!req.body) {
        return res.status(400).json({ok: false, message: 'Bad request'});
    }
    let verified = speakeasy.totp.verify({ secret: secret.valueStr,
        encoding: 'base32',
        token: req.body.userToken });

    if (!verified) {
        return res.status(403).render("2fa", {err: "Syncronization failed"});
    }
    let maxAge = 60*60;
    let token = new User(user).generateAuthToken(true);
    res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge});
    res.status(200).redirect('../../vault');
});

// @type    DELETE
// @route   /api/settings/2fa/
// @desc    route for user to deactivate users setting
// @access  PRIVATE 
router.delete('/2fa/:setting', [auth], async (req, res)=> {
    const user = req.user;
    let result = await UserSettings.find({name: req.params.setting, userId: user.id});
    if (!result[0]) {
        return res.status(400).json({ok: false, message: '2fa has not activated'});
    }
    await UserSetting.delete({name: req.params.setting, userId: user.id});
    res.status(200).json({ok: true, message: 'Unset', result: result});
});
module.exports = router;

