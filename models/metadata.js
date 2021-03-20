const connection = require('../startup/db');
require('dotenv').config();

class Metadata {
    constructor(metadata) {
        this.secretId = metadata.secretId;
        this.userId = metadata.userId;
        this.dKey = metadata.dKey;
        this.rights = metadata.rights;
    }
    save = ()=>{
        return new Promise((resolve, reject)=> {
            const query = `INSERT INTO SECRET SET ? ON DUPLICATE KEY UPDATE rights=${this.rights} `
            connection.query(query, this, (err, result)=> {
                if (err)    reject(err);
                resolve (result);
            });
        });
    }
}
Metadata.find = (filters, columns=["*"])=> {
    return new Promise((resolve, reject)=>{
        let query=`SELECT ${columns.join(', ')} FROM SECRET WHERE `, len = Object.keys(filters).length;
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
Metadata.delete = (filters)=> {
    return new Promise((resolve, reject)=>{
        let query=`DELETE FROM SECRET WHERE `;
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
Metadata.findAndModify = (filters, metadata)=> {
    return new Promise((resolve, reject)=>{
        let query=`UPDATE SECRET SET ? WHERE `;
        if (filters && typeof filters == 'object') {
            query += Object.keys(filters).map(function (key) {
                return encodeURIComponent(key) + '="' + (filters[key]) + '"';
            }).join('&&');
        }
        connection.query(query, metadata, (err, result)=>{
            if (err)    reject(err);
            else resolve(result);
        });
    });
}
module.exports = Metadata;