const express = require('express');
const router = express.Router();

// @type    POST
// @route   /
// @desc    Home page
// @access  PUBLIC 
router.get('/', (req, res)=> {
    res.status(200).render('home');
});
module.exports=router;