const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Secret = require('../models/secret');
const {auth} = require('../middleware/auth');
const _ = require('lodash');

// @type    GET
// @route   /api/secret/mine
// @desc    route for user to show his all his secrets(page render)
// @access  PRIVATE 
router.get('/',[auth], async (req, res)=> {
    const user = await User.findOne({email: req.user.email});
    if (!user) {
        return res.status(401).json({ok: false, message: 'Sorry, you are not allowed to access this page'});
    }
    const secrets = await Secret.findOne({user_id: user.id});
    res.status(200).json({ok: true, message: '', secrets:secrets});
});
router.get('/:id', [auth], async (req, res)=> {
    const user = await User.findOne({email: req.user.email});
    if (!user) {
        return res.status(401).json({ok: false, message: 'Sorry, you are not allowed to access this page'});
    }
    const secret = await Secret.findOne({id: req.params.id});
    if (!secret) 
        return res.status(404).json({ok: false, message:'Not Found'});
    res.status(200).json({ok: true, message: 'Found', secret: secret});
});

// @type    POST
// @route   /api/secret/mine
// @desc    route for user to add new secret
// @access  PRIVATE  
router.post('/add', [auth], async(req, res)=> {
    const user = await User.findOne({email: req.user.email});
    if (!user) {
        return res.status(401).json({ok: false, message: 'Sorry, you are not allowed to access this page'});
    }
    const secret = new Secret(
        _.pick(req.body, ["title", "login", "password", "website_address", "note"])
    );
    secret.user_id = user.id;
    await secret.save();
    res.status(201).json({ok: true, message: 'Inserted', secret: secret});
});

// @type    POST
// @route   /api/secret/mine
// @desc    route for user to add new secret
// @access  PRIVATE
router.delete('/:id', [auth], async(req, res)=> {
    const user = await User.findOne({email: req.user.email});
    if (!user) {
        return res.status(401).json({ok: false, message: 'Sorry, you are not allowed to access this page'});
    }
    const secret = await Secret.findOne({id: req.params.id});
    if (!secret) 
        return res.status(404).json({ok: false, message:'Not Found'});
    await Secret.delete(req.params.id);
    res.status(200).json({ok: true, message: 'Deleted', secret: secret});
});
module.exports = router;