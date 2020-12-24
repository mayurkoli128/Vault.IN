
const jwt = require('jsonwebtoken');
require('dotenv').config();

// if user trying to get private routes authenticate the route first then allow user to enter in
module.exports.auth = function(req, res, next) {
    token = req.cookies.auth_token;
    if(!token) {
        return res.status(400).redirect('../auth/login');
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_PRIVATE_TOKEN);
        req.user = decode;
        next();
    } catch (error) {
        res.status(400).redirect('../auth/login');
    }
}
// if token is valid and user trying to login or register render user to dashboard directly...
module.exports.forwardAuthenticate = function(req, res, next) {
    token = req.cookies.auth_token;
    if(!token) {
        next();
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_PRIVATE_TOKEN);
        req.user = decode;
        res.status(400).redirect('../users/me');
    } catch (error) {
        next();
    }
}