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
Secret.findOne = (filters)=> {
    return new Promise((resolve, reject)=>{
        let query=`SELECT * FROM SECRET WHERE `, len = Object.keys(filters).length;
        for (const [key, value] of Object.entries(filters)) {
            len--;
            if (len!=0) {
                query += `${key} = "${value}"&&`;
            } else {
                query += `${key} = "${value}"`;
            }
        }
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('Something failed (Record searching) :'+err));
            else resolve(result);
        });
    });
}
Secret.delete = (filters)=> {
    return new Promise((resolve, reject)=>{
        let query=`DELETE FROM SECRET WHERE `, len = Object.keys(filters).length;
        for (const [key, value] of Object.entries(filters)) {
            len--;
            if (len!=0) {
                query += `${key} = "${value}"&&`;
            } else {
                query += `${key} = "${value}"`;
            }
        }
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('Something failed (Record Deletion) :'+err));
            else resolve(result);
        });
    });
}
Secret.findAndModify = (filters, secret)=> {
    return new Promise((resolve, reject)=>{
        let query=`UPDATE SECRET SET ? WHERE `, len = Object.keys(filters).length;
        for (const [key, value] of Object.entries(filters)) {
            len--;
            if (len!=0) {
                query += `${key} = "${value}"&&`;
            } else {
                query += `${key} = "${value}"`;
            }
        }
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