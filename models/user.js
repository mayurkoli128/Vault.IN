const Joi = require('joi');
const mysql = require('mysql');
const connection = require('../startup/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class User {
    constructor(user) {
        this.username = user.username;
        this.email = user.email;
        this.password = user.password;
        this.created_date = new Date().toString();
    }
    save = ()=>{
        return new Promise((resolve, reject)=> {
            console.log(this);
            const query = `INSERT INTO USER SET ?`
            connection.query(query, this, (err, result)=> {
                if (err)    reject(new Error('Something failed (Record Insertion) :'+err));
                resolve (result);
            });
        });
    }
    generateAuthToken = ()=> {
        let token = jwt.sign({
            email: this.email,
        }, process.env.JWT_PRIVATE_TOKEN, {expiresIn: '1d'});
        return token;
    }
}
User.findOne = (val)=> {
    var filter = Object.getOwnPropertyNames(val)[0];
    return new Promise((resolve, reject)=>{
        const query = `SELECT * FROM USER WHERE ${filter} = "${val[filter]}"`;
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('Something failed (Record searching) :'+err));
            else resolve(result[0]);
        });
    });
}
User.find = ()=> {
    return new Promise((resolve, reject)=>{
        const query = `SELECT * FROM USER`;
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('Something failed (Record searching) :'+err));
            else resolve(result);
        });
    });
}
User.validate = (user)=>{
    const schema = {
        username: Joi.string().min(3).max(255).required(),
        email: Joi.string().email().required().max(255),
        password: Joi.string().min(6).max(255).required(),
        confirm_password : Joi.any().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } })
    };
    return Joi.validate(user, schema);
}
module.exports = User;