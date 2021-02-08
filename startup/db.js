// Load module mysql connection
var mysql = require('mysql');
var { database } = require('../config/default');

var connection = mysql.createConnection(database);    
connection.connect((err)=> {
    if (err)    throw err;
    else console.log('Connected to DB');
});
module.exports = connection;