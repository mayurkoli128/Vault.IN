const Joi = require('joi');
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
            const query = `INSERT INTO USER SET ?`
            connection.query(query, this, (err, result)=> {
                if (err)    reject(new Error('Something failed [Record Insertion] :'+err));
                resolve (result);
            });
        });
    }
    generateAuthToken = (is2faAuthenticated=false)=> {
        const expiresIn = 60 * 60; // an hour
        let token = jwt.sign({
            email: this.email,
            is2faAuthenticated: is2faAuthenticated,
        }, process.env.JWT_PRIVATE_TOKEN, {expiresIn: expiresIn});
        return token;
    }
}
User.findOne = (filters)=> {
    return new Promise((resolve, reject)=>{
        let query=`SELECT * FROM USER WHERE `, len = Object.keys(filters).length;
        if (filters && typeof filters == 'object') {
            query += Object.keys(filters).map(function (key) {
                return encodeURIComponent(key) + '="' + (filters[key]) + '"';
            }).join('&&');
        }
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('Something failed [Record searching] :'+err));
            else resolve(result[0]);
        });
    });
}
User.find = ()=> {
    return new Promise((resolve, reject)=>{
        const query = `SELECT * FROM USER`;
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('Something failed [Record searching] :'+err));
            else resolve(result);
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
            if (err)    reject(new Error('Something failed (Record Updation) :'+err));
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