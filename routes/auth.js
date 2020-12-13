const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const {forwardAuthenticate} = require('../middleware/auth');

// @type    POST
// @route   /api/auth/login
// @desc    route for user Login using email and password
// @access  PUBLIC 

router.get('/login', [forwardAuthenticate], (req, res) => {
    res.render('login');
})
router.post('/login', async (req, res, next) => {
    throw new Error('new Error');
    const {error} = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    let user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(400).send('Email or Password is incorrect');
    } 
    const validatePass = await bcrypt.compare(req.body.password, user.password);
    if (!validatePass) {
        return res.status(400).send('Email or Password is incorrect');
    }
    // const token = jwt.sign({
    //     // payload...
    //     id:user.id,
    //     name: user.name
    // }, process.env.JWTWEBTOKEN);
    const maxAge = 600;
    user = new User(_.pick(user, ['id', 'username', 'email', 'password', 'created_date']));
    const token = user.generateAuthToken();
    res.cookie('auth_token', token, {httpOnly: true, maxAge: 1000*maxAge});
    res.status(400).redirect('../users/me');
});

function validate(user) {
    const schema = Joi.object({
        email: Joi.string().email().max(255).required(),
        password: Joi.string().min(6).max(255).required(),
    });
    return schema.validate(user);
}
module.exports = router;