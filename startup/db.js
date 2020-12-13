// Load module
var mysql = require('mysql');
var connection      =    mysql.createConnection({
    connectionLimit : 10,
    host     : '127.0.0.1',
    user     : 'root',
    password : 'root128',
    database : 'keeper',
    debug    :  false,
});    
module.exports = connection;