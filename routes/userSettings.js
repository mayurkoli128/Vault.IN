const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth');
const UserSetting = require('../models/userSetting');
const User = require('../models/user');
const _ = require('lodash');

router.post('/', [auth],async(req, res)=> {
    const user = await User.findOne({email: req.user.email});
    if (!user) {
        return res.status(401).json({ok: false, message: 'Sorry, you are not allowed to access this page'});
    }
    if (!req.body) {
        return res.status(400).json({ok: false, message: 'Bad request'});
    }
    let setting = new UserSetting(_.pick(req.body, ["name", "type", "value_int", "value_str"]));
    setting.user_id = user.id;
    const result = await setting.save();
    res.status(200).json(result);
});

router.get('/', [auth], async(req, res)=> {
    const user = await User.findOne({email: req.user.email});
    if (!user) {
        return res.status(401).json({ok: false, message: 'Sorry, you are not allowed to access this page'});
    }
    const result = await UserSetting.findOne({user_id: user.id});
    res.status(200).json(result);
});
router.patch('/', (req, res)=> {

});
module.exports = router;