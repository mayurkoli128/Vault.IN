const { error } = require("winston");

module.exports = function(err, req, res, next) {
    res.status(500).json({ok: false, message: err});
}