const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const {auth} = require('../middleware/auth');

// @type    GET
// @route   /api/users/:username
// @desc    route to get public info of user
// @access  PUBLIC 
router.get('/:username', [auth], async(req, res)=> {
    // public data of a user  
    const user = await User.find({username: req.params.username}, ["id", "username", "publicKey"]);
    if (!user) {
        return res.status(404).json({ok: false, message: "Username not found."});
    }
    res.status(200).json({ok: true, message: "success", user: req.user, friend: user});
});

// @type    PATCH
// @route   /api/users/edit-account/password
// @desc    route for user to change password
// @access  PRIVATE 
router.patch('/edit-account/password', [auth], async(req, res)=> {
    let user = req.user;
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    await User.findAndModify({id: user.id}, {password: password, privateKey: req.body.privateKey});
    res.status(200).json({ok: true, message: 'Password reset successfully.'});;
});

// @type    PATCH
// @route   /api/users/edit-account/
// @desc    route for user to change email
// @access  PRIVATE 
router.patch('/edit-account/username', [auth], async(req, res)=> {});  

module.exports = router;