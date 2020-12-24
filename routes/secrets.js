const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Secret = require('../models/secret');
const {auth, forwardAuthenticate} = require('../middleware/auth');
const _ = require('lodash');


// @type    GET
// @route   /api/secret/mine
// @desc    route for user to show his all his secrets(page render)
// @access  PRIVATE 
router.get('/mine', [auth], async (req, res)=> {
    const user = await User.findOne({email: req.user.email});
    const records = await Secret.findOne({user_id: user.id});
    console.log(records);
    res.status(200).send(records);
});

// @type    POST
// @route   /api/secret/mine
// @desc    route for user to add new secret
// @access  PRIVATE  
router.post('/add', [auth], async(req, res)=> {
    const user = await User.findOne({email: req.user.email});

    const secret = new Secret(
        _.pick(req.body, ["title", "login", "password", "website_address", "note", "user_id", "last_modified"])
    );
    secret.user_id = user.id;
    console.log(secret);
    const result = await secret.save();
    req.flash('success_msg', 'Record Inserted Successsfully!');
    res.status(200).redirect('../users/me');
});

module.exports = router;