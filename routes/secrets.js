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
    res.status(200).json({ok: true, message: 'Success', secrets:secrets, user: user.username});
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
    res.status(201).json({ok: true, message: 'Inserted successfully!', secret: data});
});
// @type    GET
// @route   /api/secret/:id
// @desc    route for user to show his secret with id=:id
// @access  PRIVATE 
router.get('/:secretId', [auth], async (req, res)=> {
    const user = req.user;
    let secret = (await SecretRecord.find({id: req.params.secretId}, ["title", "id"]))[0];
    if (!secret) {
        return res.status(404).json({ok: false, message:'Secret not found.'});
    }
    const yourSecret = (await Secret.find({secretId: req.params.secretId, userId: user.id}, ["title", "rights", "login", "SECRET_DATA_RECORD.password", "websiteAddress", "note", "dKey"]))[0];
    if (!yourSecret) 
        return res.status(404).json({ok: false, message:'You are not allow to access the secret.'});
    if (yourSecret.rights < rights.READ) {
        return res.status(405).json({ok: false, message: "Sorry! you can't read the secret."});
    }
    res.status(200).json({ok: true, message: 'Found', secret: yourSecret, user: user});
});

// @type    POST
// @route   /api/secret/mine
// @desc    route for user to add new secret
// @access  PRIVATE
router.delete('/:secretId', [auth], async(req, res)=> {
    const user = req.user;
    let secret = (await SecretRecord.find({id: req.params.secretId}, ["title", "id"]))[0];
    if (!secret) {
        return res.status(404).json({ok: false, message:'Secret not found.'});
    }
    let yourSecret = (await Secret.find({secretId: req.params.secretId, userId: user.id}, ["username", "rights"]))[0];
    if (!yourSecret) {
        return res.status(404).json({ok: false, message:'You are not allow to access the secret.'});
    }
    if (yourSecret.rights < rights.SHARE) {
        return res.status(405).json({ok: false, message: "Sorry! you can't delete the secret."});
    }
    await Secret.delete(req.params.secretId);
    res.status(200).json({ok: true, message: 'Deleted successfully!', secret: secret});
});

// @type    PATCH
// @route   /api/secret/1
// @desc    route for user to update secret
// @access  PRIVATE
router.patch('/:secretId/metadata', [auth], async (req, res)=> {
    const user = req.user;
    let secret = (await SecretRecord.find({id: req.params.secretId}, ["title", "id"]))[0];
    if (!secret) {
        return res.status(404).json({ok: false, message:'Secret not found.'});
    }
    let yourSecret = (await Secret.find({secretId: req.params.secretId, userId: user.id}, ["rights"]))[0];
    if (!yourSecret || yourSecret.rights < rights.READ) {
        return res.status(405).json({ok: false, message:'You are not allow to access the secret.'});
    }
    let friend = await User.find({username: req.body.friendName}, ["username", "id"]);
    if (!friend) {
        return res.status(401).json({ok: false, message: 'Your friend is not found.'});
    }
    if (friend.id == user.id) {
        return res.status(405).json({ok: false, message: "Sorry! you can't update your rights."});
    }
    let friendSecret = (await Secret.find({secretId: req.params.secretId, userId: friend.id}, ["rights"]))[0];
    if (!friendSecret || friendSecret.rights < rights.READ) {
        return res.status(405).json({ok: false, message:'Your friend is not allow to access the secret.'});
    }
    if (yourSecret.rights < rights.SHARE) {
        return res.status(405).json({ok: false, message: "Sorry! you can't update the rights of your friends."});
    }
    const result = await Metadata.findAndModify({secretId: req.params.secretId, userId: friend.id}, {rights: req.body.rights});
    res.status(200).json({ok: true, message: `Rights has changed for ${friend.username}.`});
});

// @type    PATCH
// @route   /api/secret/1
// @desc    route for user to update secret
// @access  PRIVATE
router.patch('/:secretId/data', [auth], async (req, res)=> {
    const user = req.user;
    let secret = (await SecretRecord.find({id: req.params.secretId}, ["title", "id"]))[0];
    if (!secret) {
        return res.status(404).json({ok: false, message:'Secret not found.'});
    }
    let yourSecret = (await Secret.find({secretId: req.params.secretId, userId: user.id}, ["rights", "username"]))[0];
    if (!yourSecret) {
        return res.status(405).json({ok: false, message:'You are not allow to access the secret.'});
    }
    if (yourSecret.rights < rights.WRITE) {
        return res.status(405).json({ok: false, message: "Sorry! you can't update the secret."});
    }
    secret = new SecretRecord(
        _.pick(req.body, ["login", "password", "websiteAddress", "note", "lastModifiedAt"])
    );
    Object.entries(secret).forEach(([key, value]) => {
        if (typeof value === 'undefined')   delete secret[key];
    });
    secret.lastModifiedBy = user.id;
    const result = await SecretRecord.findAndModify({id: req.params.secretId}, secret);
    res.status(200).json({ok: true, message: "Data has been updated successfully!"});
});

// @type    GET
// @route   /api/secret/:id
// @desc    route for user to show his secret with id=:id
// @access  PRIVATE 
router.get('/owners/:secretId', [auth], async (req, res)=> {
    const user = req.user;
    let secret = (await SecretRecord.find({id: req.params.secretId}, ["title", "id"]))[0];
    if (!secret) {
        return res.status(404).json({ok: false, message:'Secret not found.'});
    }
    const yourSecret = (await Secret.find({secretId: req.params.secretId, userId: user.id}, ["rights"]))[0];
    if (!yourSecret) {
        return res.status(405).json({ok: false, message:'You are not allow to access the secret.'});
    }
    const owners = (await Secret.find({secretId: req.params.secretId}, ["rights", "username", "publicKey", "avatar", "USER.id"]));
    res.status(200).json({ok: true, message: 'Found', owners: owners, user: {username: user.username, rights: yourSecret.rights}});
});

// @type    POST
// @route   /api/secret/mine
// @desc    route for user to add new secret
// @access  PRIVATE  
router.post('/share', [auth], async(req, res)=> {
    const user = req.user;
    let secret = (await SecretRecord.find({id: req.body.secretId}, ["title", "id"]))[0];
    if (!secret) {
        return res.status(404).json({ok: false, message:'Secret not found.'});
    }
    let yourSecret = (await Secret.find({userId: user.id, secretId: req.body.secretId}, ["rights", "title"]))[0];
    if (!yourSecret) {
        return res.status(404).json({ok: false, message: "You are not allow to access the secret."});
    }
    if (yourSecret.rights < rights.SHARE) {
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
    res.status(200).json({ok: true, message: `You just shared a secret with ${friend.username}.`});
});
router.patch('/unshare', [auth], async (req, res)=> {
    // check the secret exist or not...
    const user = req.user;
    let secret = (await SecretRecord.find({id: req.body.secretId}, ["title", "id"]))[0];
    if (!secret) {
        return res.status(404).json({ok: false, message:'Secret not found.'});
    }
    // check user associate with the secret or not...
    let yourSecret = (await Secret.find({userId: user.id, secretId: req.body.secretId}, ["rights", "title"]))[0];
    if (!yourSecret) {
        return res.status(404).json({ok: false, message: "You are not allow to access the secret."});
    }
    if (yourSecret.rights < rights.SHARE) {
        return res.status(405).json({ok: false, message: "Sorry! you can't unshare the secret."})
    }
    let friend = await User.find({username: req.body.friendName}, ["username", "id"]);
    if (!friend) {
        return res.status(404).json({ok: false, message: "Friend not found."});
    }
    if (friend.id == user.id) {
        return res.status(405).json({ok: false, message: "Sorry! you can't unshare with yourself."});
    }
    delete req.body.dKeys[friend.username];
    req.body.friendId = friend.id;
    // start atomic operation
    // 1) delete ratnu from record association
    // 2) change dKeys 
    // 3) change secret data
    await Secret.unshareOperation(req.body);
    res.status(200).json({ok: true, message: `You just unshared a secret with ${friend.username}.`});
});
module.exports = router;