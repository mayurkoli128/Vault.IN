const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Secret = require('../models/secret');
const {auth, forwardAuthenticate} = require('../middleware/auth');
const { conforms } = require('lodash');

// @type    GET
// @route   /api/users/me
// @desc    route for to get currently login user
// @access  PUBLIC 
router.get('/me', [auth],async (req, res)=> {
    const user = await User.findOne({email:req.user.email});
    const secrets = await Secret.findOne({user_id: user.id});
    // fetching all the records & ecnrypt them....
    res.status(200).render('dashboard', {
        secrets: secrets,
        user: user,
        err : req.flash('error'), 
        success_msg: req.flash('success_msg'),
        info: req.flash('info')
    });
});
// @type    post
// @route   /api/users/register
// @desc    route for user to register
// @access  PUBLIC 
router.get('/register', [forwardAuthenticate], (req, res)=> {
    res.render('register');
});
router.post('/register', async(req, res) => {
    const {error} = User.validate(req.body);
    if(error) {
        return res.status(400).render('register', {err: error.details[0].message});
    }
    //make sure that email is unique...
    let user = await User.findOne({email: req.body.email});
    
    if(user) {
        return res.status(400).render('register', {err: 'Sorry! That email address already exist'});
    }
    // make sure that username is unique..
    user = await User.findOne({username: req.body.username});
    
    if(user) {
        return res.status(400).render('register', {err: 'Sorry! Username already taken.'});
    }
    //if valid create user object.
    user = new User(_.pick(req.body, ['username', 'email', 'password', 'created_date']));
    //create hash of password.
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    //insert into database
    const temp = await user.save();
    //send user object in response (use lodash for selecting properties of user)

    // send json web token in response...
    let maxAge = 24*60*60;
    let token = user.generateAuthToken();
    res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge});
     res
         .status(200)
         .redirect('register');
});

module.exports = router;