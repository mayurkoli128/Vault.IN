const connection = require('../startup/db');
require('dotenv').config();

class SecretRecord {
    constructor(secret) {
        this.title = secret.title;
        this.login = secret.login;
        this.password = secret.password;
        this.websiteAddress = secret.websiteAddress;
        this.note = secret.note;
        this.lastModifiedBy = secret.userId;
        this.lastModifiedAt = new Date().toString();
        this.type = secret.type;
    }
    save = ()=>{
        return new Promise((resolve, reject)=> {
            const query = `INSERT INTO SECRET_DATA_RECORD SET ?`
            connection.query(query, this, (err, result)=> {
                if (err)    reject(err);
                resolve (result);
            });
        });
    }
}
SecretRecord.find = (filters, columns=["*"])=> {
    return new Promise((resolve, reject)=>{
        let query=`SELECT ${columns.join(', ')} FROM SECRET_DATA_RECORD WHERE `, len = Object.keys(filters).length;
        if (filters && typeof filters == 'object') {
            query += Object.keys(filters).map(function (key) {
                return encodeURIComponent(key) + '="' + (filters[key]) + '"';
            }).join('&&');
        }
        connection.query(query, (err, result)=>{
            if (err)    reject(err);
            else resolve(result);
        });
    });
}
SecretRecord.delete = (filters)=> {
    return new Promise((resolve, reject)=>{
        let query=`DELETE FROM SECRET_DATA_RECORD WHERE `, len = Object.keys(filters).length;
        if (filters && typeof filters == 'object') {
            query += Object.keys(filters).map(function (key) {
                return encodeURIComponent(key) + '="' + (filters[key]) + '"';
            }).join('&&');
        }
        connection.query(query, (err, result)=>{
            if (err)    reject(err);
            else resolve(result);
        });
    });
}
SecretRecord.findAndModify = (filters, secret)=> {
    return new Promise((resolve, reject)=>{
        let query=`UPDATE SECRET_DATA_RECORD SET ? WHERE `, len = Object.keys(filters).length;
        if (filters && typeof filters == 'object') {
            query += Object.keys(filters).map(function (key) {
                return encodeURIComponent(key) + '="' + (filters[key]) + '"';
            }).join('&&');
        }
        connection.query(query, secret, (err, result)=>{
            if (err)    reject(err);
            else resolve(result);
        });
    });
}
module.exports = SecretRecord;