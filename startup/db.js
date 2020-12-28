// Load module mysql connection
var mysql = require('mysql');
require('dotenv').config();

var connection      =    mysql.createConnection({
    connectionLimit : 10,
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    debug    :  false,
});    
if (connection) {
    console.log('connected to DB')
}
module.exports = connection;