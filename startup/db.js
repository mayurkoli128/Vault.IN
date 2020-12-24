// Load module mysql connection
var mysql = require('mysql');

var connection      =    mysql.createConnection({
    connectionLimit : 10,
    host     : '127.0.0.1',
    user     : 'root',
    password : 'root128',
    database : 'keeper',
    debug    :  false,
});    
if (connection) {
    console.log('connected to db...')
}
module.exports = connection;