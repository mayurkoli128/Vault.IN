const express = require('express');
const router = express.Router();
const Secret = require('../models/secret');
const SecretRecord = require('../models/secretRecord');
const Metadata = require('../models/metadata');
const User = require('../models/user');
const {auth} = require('../middleware/auth');
const _ = require('lodash');

const rights = {
    READ: 0,
    WRITE: 1,
    SHARE: 2,
}
// @type    GET
// @route   /api/secret/mine
// @desc    route for user to show his all secrets(page render)
// @access  PRIVATE 
router.get('/',[auth], async (req, res)=> {
    const user = req.user;
    const secrets = await Secret.find({userId: user.id}, ["SECRET_DATA_RECORD.id", "title", "lastModifiedAt"]);
    res.status(200).json({ok: true, message: 'Success', secrets:secrets, username: user.username});
});

// @type    GET
// @route   /api/secret/:id
// @desc    route for user to show his secret with id=:id
// @access  PRIVATE 
router.get('/:id', [auth], async (req, res)=> {
    const user = req.user;
    const secret = (await Secret.find({secretId: req.params.id, userId: user.id}, ["title", "rights", "login", "SECRET_DATA_RECORD.password", "websiteAddress", "note", "dKey"]))[0];
    if (!secret) 
        return res.status(404).json({ok: false, message:'Secret not found.'});
    if (secret.rights < rights.READ) {
        return res.status(405).json({ok: false, message: "Sorry! you can't read the secret."});
    }
    res.status(200).json({ok: true, message: 'Found', secret: secret, user: user});
});

// @type    GET
// @route   /api/secret/:id
// @desc    route for user to show his secret with id=:id
// @access  PRIVATE 
router.get('/owners/:id', [auth], async (req, res)=> {
    const user = req.user;
    const userRights = await Secret.find({secretId: req.params.id, userId: user.id}, ["rights"]);
    if (!userRights[0]) {
        return res.status(404).json({ok: false, message:'Secret not found.'});
    }
    const owners = (await Secret.find({secretId: req.params.id}, ["rights", "username"]));
    if (!owners[0]) {
        return res.status(404).json({ok: false, message:'Secret not found.'});
    }
    res.status(200).json({ok: true, message: 'Found', owners: owners, user: {username: user.username, rights: userRights[0].rights}});
});

// @type    POST
// @route   /api/secret/mine
// @desc    route for user to add new secret
// @access  PRIVATE  
router.post('/add', [auth], async(req, res)=> {
    const user = req.user;
    const data = new SecretRecord(
        _.pick(req.body.secret, ["title", "login", "password", "websiteAddress", "note"])
    );
    data.type = "PRIVATE";
    data.lastModifiedBy = user.id;
    const metadata = new Metadata({userId : user.id, dKey : req.body.dKey, rights : rights.SHARE});
    await new Secret({data, metadata}).save();
    res.status(201).json({ok: true, message: 'Inserted', secret: data});
});

// @type    POST
// @route   /api/secret/mine
// @desc    route for user to add new secret
// @access  PRIVATE  
router.post('/share', [auth], async(req, res)=> {
    const user = req.user;
    let secret = (await Secret.find({userId: user.id, secretId: req.body.secretId}, ["rights", "title"]))[0];
    if (!secret) {
        return res.status(404).json({ok: false, message: "Secret not found"});
    }
    if (secret.rights < rights.SHARE) {
        return res.status(405).json({ok: false, message: "Sorry! you can't share the secret."})
    }
    if (req.body.userId == user.id) {
        return res.status(405).json({ok: false, message: "Sorry! you can't share with yourself."});
    }
    let friend = await User.find({id: req.body.userId}, ["username"]);
    if (!friend) {
        return res.status(404).json({ok: false, message: "Friend not found."});
    }
    let metadata = new Metadata(_.pick(req.body, ["secretId", "userId", "dKey", "rights"]));
    await metadata.save();
    res.status(200).json({ok: true, message: 'Shared'});
});

// @type    POST
// @route   /api/secret/mine
// @desc    route for user to add new secret
// @access  PRIVATE
router.delete('/:id', [auth], async(req, res)=> {
    const user = req.user;
    const secret = (await Secret.find({secretId: req.params.id, userId: user.id}, ["username", "rights"]))[0];
    if (!secret) {
        return res.status(404).json({ok: false, message:'Secret not found.'});
    }
    if (secret.rights < rights.SHARE) {
        return res.status(405).json({ok: false, message: "Sorry! you can't delete the secret."});
    }
    await Secret.delete(req.params.id);
    res.status(200).json({ok: true, message: 'Deleted', secret: secret});
});

// @type    PATCH
// @route   /api/secret/1
// @desc    route for user to update secret
// @access  PRIVATE
router.patch('/:id/metadata', [auth], async (req, res)=> {
    const user = req.user;
    let secret = (await Secret.find({secretId: req.params.id, userId: user.id}, ["rights"]))[0];
    if (!secret) {
        return res.status(404).json({ok: false, message:'Secret not found.'});
    }
    if (secret.rights < rights.SHARE) {
        return res.status(405).json({ok: false, message: "Sorry! you can't update the rights of your friends."});
    }
    let friend = await User.find({username: req.body.friendUsername}, ["username", "id"]);
    if (!friend) {
        return res.status(404).json({ok: false, message: "Friend not found."});
    }
    if (friend.id == user.id) {
        return res.status(405).json({ok: false, message: "Sorry! you can't update your rights."});
    }
    const result = await Metadata.findAndModify({secretId: req.params.id, userId: friend.id}, {rights: req.body.rights});
    res.status(200).json({ok: true, message: "success"});
});

// @type    PATCH
// @route   /api/secret/1
// @desc    route for user to update secret
// @access  PRIVATE
router.patch('/:id/data', [auth], async (req, res)=> {
    const user = req.user;
    let secret = (await Secret.find({secretId: req.params.id, userId: user.id}, ["rights", "username"]))[0];
    if (!secret) 
        return res.status(404).json({ok: false, message:'Secret not found'});
    
    if (secret.rights < rights.WRITE) {
        return res.status(405).json({ok: false, message: "Sorry! you can't update the secret."});
    }
    secret = new SecretRecord(
        _.pick(req.body, ["login", "password", "websiteAddress", "note"])
    );
    secret.lastModifiedBy = user.id;
    const result = await SecretRecord.findAndModify({id: req.params.id}, req.body);
    res.status(200).json({ok: true, message: "success"});
});

router.post('/unshare', (req, res)=> {

});
module.exports = router;