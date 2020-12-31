const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
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
    const maxAge = 24*60*60;
    user = new User(_.pick(user, ['id', 'username', 'email', 'password', 'created_date']));
    const token = user.generateAuthToken();
    res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge});
    res.status(200).redirect('../users/me');
});

// @type    GET
// @route   /api/auth/logout
// @desc    route for user to logout
// @access  PRIVATE 
router.get('/logout', (req, res) => {
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