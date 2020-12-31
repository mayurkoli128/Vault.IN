const connection = require('../startup/db');
require('dotenv').config();

class UserSettings {
    constructor(setting) {
        this.name = setting.name; //primary_key
        this.user_id = setting.user_id; // primary_key+foreign key
        this.type = setting.type; // select type whether setting type is string or integer (user_laguage: string, auto_logout_time: integer)
        this.value_int = setting.value_int; 
        this.value_str = setting.value_str
        this.last_modified = new Date().toString();
    }
    save = ()=>{
        return new Promise((resolve, reject)=> {
            let query;
            if (!this.type)
                query = `INSERT INTO USER_SETTINGS SET ? ON DUPLICATE KEY UPDATE value_int=${this.value_int}, last_modified="${this.last_modified}"`
            else 
                query = `INSERT INTO USER_SETTINGS SET ? ON DUPLICATE KEY UPDATE value_str="${this.value_str}", last_modified="${this.last_modified}"`
            connection.query(query, this, (err, result)=> {
                if (err)    reject(err);
                resolve (result);
            });
        });
    }
}
UserSettings.findOne = (val)=> {
    var filter = Object.getOwnPropertyNames(val)[0];
    return new Promise((resolve, reject)=>{
        const query = `SELECT * FROM USER_SETTINGS WHERE ${filter} = "${val[filter]}"`;
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('SOMETHING FAILED [USER_SETTINGS, RECORD_SEARCHING] :'+err));
            else resolve(result);
        });
    });
}
UserSettings.delete = (name)=> {
    return new Promise((resolve, reject)=>{
        const query = `DELETE FROM USER_SETTINGS WHERE name = "${name}"`;
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('SOMETHING FAILED [USER_SETTINGS, RECORD_DELETION] :'+err));
            else resolve(result);
        });
    });
}
module.exports = UserSettings;