const Joi = require('joi');
const connection = require('../startup/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class User {
    constructor(user) {
        this.username = user.username;
        this.password = user.password;
        this.publicKey = user.publicKey;
        this.privateKey = user.privateKey;
        this.avatar = user.avatar;
        this.createdDate = new Date().toString();
    }
    save = ()=>{
        return new Promise((resolve, reject)=> {
            const query = `INSERT INTO USER SET ?`;
            connection.query(query, this, (err, result)=> {
                if (err)    reject(err);
                resolve (result);
            });
        });
    }
    generateAuthToken = (is2faAuthenticated=false)=> {
        const expiresIn = 60 * 60; // an hour
        let token = jwt.sign({
            username: this.username,
            is2faAuthenticated: is2faAuthenticated,
        }, process.env.JWT_PRIVATE_TOKEN || "UNSECURED_JWT_PRIVATE_TOKEN", {expiresIn: expiresIn});
        return token;
    }
}
User.find = (filters, columns=["*"])=> {
    return new Promise((resolve, reject)=>{
        let query=`SELECT ${columns.join(', ')} FROM USER WHERE `, len = Object.keys(filters).length;
        if (filters && typeof filters == 'object') {
            query += Object.keys(filters).map(function (key) {
                return encodeURIComponent(key) + '="' + (filters[key]) + '"';
            }).join('&&');
        }
        connection.query(query, (err, result)=>{
            if (err)    reject(err);
            else resolve(result[0]);
        });
    });
}
User.findAndModify = (filters, changes)=> {
    return new Promise((resolve, reject)=>{
        let query=`UPDATE USER SET ? WHERE `, len = Object.keys(filters).length;
        if (filters && typeof filters == 'object') {
            query += Object.keys(filters).map(function (key) {
                return encodeURIComponent(key) + '="' + (filters[key]) + '"';
            }).join('&&');
        }
        connection.query(query, changes, (err, result)=>{
            if (err)    reject(err);
            else resolve(result);
        });
    });
}
User.validate = (user)=>{
    const schema = {
        username: Joi.string().min(3).max(255).required(),
        publicKey: Joi.string().required().max(1040),
        privateKey: Joi.string().required().max(4400),
        password: Joi.string().min(6).max(255).required(),
        confirmPassword : Joi.any().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }),
        avatar: Joi.string().min(6).max(10).required(),
    };
    return Joi.validate(user, schema);
}
module.exports = User;