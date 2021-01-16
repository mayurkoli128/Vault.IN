const express = require('express');
const router = express.Router();
const Secret = require('../models/secret');
const {auth} = require('../middleware/auth');
const _ = require('lodash');

// @type    GET
// @route   /api/secret/
// @desc    route for user to show his all secrets(page render)
// @access  PRIVATE 
router.get('/',[auth], async (req, res)=> {
    const user = req.user;
    const secrets = await Secret.find({user_id: user.id}, ["id", "title", "last_modified"]);
    
    res.status(200).json({ok: true, message: 'Success', secrets:secrets, username: user.username});
});

// @type    GET
// @route   /api/secret/all
// @access  PRIVATE 
router.get('/all',[auth], async (req, res)=> {
    const user = req.user;
    const secrets = await Secret.find({user_id: user.id}, ["id", "login", "password", "website_address", "note"]);
    
    res.status(200).json({ok: true, message: 'Success', secrets:secrets, username: user.username});
});
// @type    GET
// @route   /api/secret/:id
// @desc    route for user to show his secret with id=:id
// @access  PRIVATE 
router.get('/:id', [auth], async (req, res)=> {
    const user = req.user;
    const secret = (await Secret.find({id: req.params.id, user_id: user.id}, ["title", "login", "password", "website_address", "note"]))[0];
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
        _.pick(req.body, ["id", "title", "login", "password", "website_address", "note"])
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
    const user = req.user;
    const secret = (await Secret.find({id: req.params.id, user_id: user.id}))[0];
    if (!secret) 
        return res.status(404).json({ok: false, message:'Not Found'});
    await Secret.delete({id: req.params.id, user_id: user.id});
    res.status(200).json({ok: true, message: 'Deleted', secret: secret});
});

// @type    PATCH
// @route   /api/secret/1
// @desc    route for user to update secret
// @access  PRIVATE
router.patch('/:id',[auth], async (req, res)=> {
    const user = req.user;
    const secret = await Secret.find({id: req.params.id, user_id: user.id});
    if (!secret) 
        return res.status(404).json({ok: false, message:'Not Found'});
    const result = await Secret.findAndModify({id: req.params.id, user_id: user.id}, req.body);
    res.send(result);
});
module.exports = router;