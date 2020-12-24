const Joi = require('joi');
const mysql = require('mysql');
const connection = require('../startup/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class Secret {
    constructor(secret) {
        this.title = secret.title;
        this.login = secret.login;
        this.password = secret.password;
        this.website_address = secret.website_address;
        this.note = secret.note;
        this.user_id = secret.user_id;
        this.last_modified = new Date().toString();
    }
    save = ()=>{
        return new Promise((resolve, reject)=> {
            const query = `INSERT INTO SECRET SET ?`
            connection.query(query, this, (err, result)=> {
                if (err)    reject(new Error('Something failed (Record Insertion) :'+err));
                resolve (result);
            });
        });
    }
}
Secret.findOne = (val)=> {
    var filter = Object.getOwnPropertyNames(val)[0];
    return new Promise((resolve, reject)=>{
        const query = `SELECT * FROM SECRET WHERE ${filter} = "${val[filter]}"`;
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('Something failed (Record searching) :'+err));
            else resolve(result);
        });
    });
}
Secret.find = ()=> {
    return new Promise((resolve, reject)=>{
        const query = `SELECT * FROM SECRET`;
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('Something failed (Record searching) :'+err));
            else resolve(result);
        });
    });
}
module.exports = Secret;