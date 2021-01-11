const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Secret = require('../models/secret');
const {auth} = require('../middleware/auth');
const _ = require('lodash');

// @type    GET
// @route   /api/secret/mine
// @desc    route for user to show his all secrets(page render)
// @access  PRIVATE 
router.get('/',[auth], async (req, res)=> {
    const user = req.user;
    const secrets = await Secret.findOne({user_id: user.id});
    
    res.status(200).json({ok: true, message: 'Success', secrets:secrets, username: user.username});
});
router.get('/:id', [auth], async (req, res)=> {
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
    const user = req.user;
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
    const secret = await Secret.findOne({id: req.params.id});
    if (!secret) 
        return res.status(404).json({ok: false, message:'Not Found'});
    await Secret.delete({id: req.params.id});
    res.status(200).json({ok: true, message: 'Deleted', secret: secret});
});

router.patch('/:id',[auth], async (req, res)=> {
    const secret = await Secret.findOne({id: req.params.id});
    if (!secret) 
        return res.status(404).json({ok: false, message:'Not Found'});
    const result = await Secret.findAndModify({id: req.params.id}, req.body);
    res.send(result);
});
module.exports = router;