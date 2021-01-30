const express = require('express');
const router = express.Router();
const Secret = require('../models/secret');
const {auth} = require('../middleware/auth');


// @type    POST
// @route   /
// @desc    Home page
// @access  PUBLIC 
router.get('/', (req, res)=> {
    res.status(200).render('home');
});

// @type    GET
// @route   /api/users/me
// @desc    route for to get currently login user
// @access  PRIVATE 
router.get('/vault', [auth], async (req, res)=> {
    const user = req.user;
    const secrets = await Secret.find({userId: user.id});
    // fetching all the records & ecnrypt them....
    res.status(200).render('vault', {
        secrets: secrets,
        user: user,
        err : req.flash('error'), 
        success_msg: req.flash('success_msg'),
        info: req.flash('info')
    });
});

// @type    GET
// @route   /api/auth/logout
// @desc    route for user to logout
// @access  PRIVATE 
router.get('/logout', [auth],(req, res) => {
    res.cookie('auth_token', "", {maxAge: 1});
    res.redirect('/');
});

module.exports=router;