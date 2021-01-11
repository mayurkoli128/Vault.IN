const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Joi = require('joi');
const User = require('../models/user');
const UserSetting = require('../models/userSetting');
const bcrypt = require('bcryptjs');
const {auth} = require('../middleware/auth');
const {forwardAuthenticate} = require('../middleware/auth');

// @type    POST
// @route   /api/auth/login
// @desc    route for user Login using email and password (page render)
// @access  PUBLIC 
router.get('/login', [forwardAuthenticate],(req, res) => {
    res.render('login', {
        err : req.flash('error'), 
        success_msg: req.flash('success_msg'),
    });
});
// @type    POST
// @route   /api/auth/login
// @desc    route for user Login using email/username and password
// @access  PUBLIC 
router.post('/login', async (req, res) => {
    const {error} = validate(req.body);
    if (error) {
        return res.status(400).render('login', {err: error.details[0].message});
    }
    let user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(401).render('login', {err: 'Email or Password is incorrect'});
    } 
    const validatePass = await bcrypt.compare(req.body.password, user.password);
    if (!validatePass) {
        return res.status(401).render('login', {err: 'Email or Password is incorrect'});
    }
    const maxAge = 60*60;
    const token = new User(user).generateAuthToken();
    res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge});
    // check if user has 2fa activated or not ...

    const twofaAuth = await UserSetting.findOne({user_id: user.id, name: "2fa"});
    if (twofaAuth[0]) {
        return res.status(206).redirect('../settings/2fa/authenticate');
    }
    res.status(200).redirect('../users/me');
});

// @type    GET
// @route   /api/auth/logout
// @desc    route for user to logout
// @access  PRIVATE 
router.get('/logout', [auth],(req, res) => {
    res.cookie('auth_token', "", {maxAge: 1});
    res.redirect('/');
});
function validate(user) {
    const schema = Joi.object({
        email: Joi.string().email().max(255).required(),
        password: Joi.string().min(64).required(),
    });
    return schema.validate(user);
}
module.exports = router;