const express = require('express');
const router = express.Router();
const User = require('../models/user');
const PaymentSecret = require('../models/secret');
const {auth, forwardAuthenticate} = require('../middleware/auth');
const _ = require('lodash');

// @type    GET
// @route   /api/secret/mine
// @desc    route for user to show his all his secrets(page render)
// @access  PRIVATE 
router.get('/mine', [auth], async (req, res)=> {
    const user = await User.find({email: req.user.email});
    const records = await Secret.find({user_id: user.id});
    console.log(records);
    res.status(200).send(records);
});

// @type    POST
// @route   /api/secret/mine
// @desc    route for user to add new secret
// @access  PRIVATE  
router.post('/add', [auth], async(req, res)=> {
    const user = await User.find({email: req.user.email});
    const secret = new Secret(
        _.pick(req.body, ["title", "login", "password", "websiteAddress", "note", "userId"])
    );
    const result = await secret.save();
    res.status(200).send(result);
});
module.exports = router;