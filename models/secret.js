const connection = require('../startup/db');
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
Secret.delete = (id)=> {
    return new Promise((resolve, reject)=>{
        const query = `DELETE FROM SECRET WHERE id = "${id}"`;
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('Something failed (Record Deletion) :'+err));
            else resolve(result);
        });
    });
}
Secret.findAndModify = (id, secret)=> {
    return new Promise((resolve, reject)=>{
        const query = `UPDATE SECRET SET ? WHERE id = "${id}"`;
        connection.query(query, secret, (err, result)=>{
            if (err)    reject(new Error('Something failed (Record Updation) :'+err));
            else resolve(result);
        });
    });
}
// client-side validation is required, data is encrypted completely!
Secret.validate = (secret)=>{
    const schema = {
        
    };
    return Joi.validate(secret, schema);
}
module.exports = Secret;