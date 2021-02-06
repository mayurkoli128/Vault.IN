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
// @desc    route for user Login using username and password (page render)
// @access  PUBLIC 
router.get('/login', [forwardAuthenticate],(req, res) => {
    res.render('login', {
        err : req.flash('error'), 
        success_msg: req.flash('success_msg'),
    });
});

// @type    POST
// @route   /api/auth/login
// @desc    route for user Login using username/username and password
// @access  PUBLIC 
router.post('/login', async (req, res) => {

    let user = await User.find({username: req.body.username});
    if (!user) {
        return res.status(401).render('login', {err: 'Username or Password is incorrect'});
    } 
    const validatePass = await bcrypt.compare(req.body.password, user.password);
    if (!validatePass) {
        return res.status(401).render('login', {err: 'Username or Password is incorrect'});
    }
    let maxAge = 60*60;
    const twofaAuth = await UserSetting.find({userId: user.id, name: "2fa"});
    if (twofaAuth[0]) {
        maxAge = 2*60;
    }
    const token = new User(user).generateAuthToken();
    res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge});
    // check if user has 2fa activated or not ...

    if (twofaAuth[0]) {
        return res.status(206).redirect('../settings/2fa/authenticate');
    }
    res.status(200).redirect('../vault');
});

// @type    GET
// @route   /api/users/register
// @desc    route for user to register
// @access  PUBLIC 
router.get('/register', [forwardAuthenticate], (req, res)=> {
    res.render('register');
});

// @type    POST
// @route   /api/users/register
// @desc    route for user to register
// @access  PRIVATE 
router.post('/register', async(req, res) => {
    const {error} = User.validate(req.body);
    if (error) {
        return res.status(400).json({ok:false, message: error.details[0].message});
    }
    // make sure that username is unique..
    let user = await User.find({username: req.body.username});
    
    if(user) {
        return res.status(409).json({ok: false, message: 'Sorry! Username already taken.'});
    }
    //if valid create user object.
    user = new User(_.pick(req.body, ['username', 'password', 'publicKey', 'privateKey', 'avatar']));
    //create hash of password.
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    //insert into database
    await user.save();
    //send user object in response (use lodash for selecting properties of user)

    // send json web token in response...
    let maxAge = 60*60;
    let token = user.generateAuthToken();
    res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge});
    res
        .status(200)
        .json({ok: true, message: "Success", user: _.pick(user, ["username", "publicKey"])});
});

module.exports = router;