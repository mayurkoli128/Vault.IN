
module.exports = function(err, req, res, next) {
    console.log(err);
    res.status(500).json({ok: false, message: err});
}