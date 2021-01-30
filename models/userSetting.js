const connection = require('../startup/db');
require('dotenv').config();

class UserSettings {
    constructor(setting) {
        this.name = setting.name; //primary_key
        this.userId = setting.userId; // primary_key+foreign key
        this.type = setting.type; // select type whether setting type is string or integer 
        this.valueInt = setting.valueInt; 
        this.valueStr = setting.valueStr
        this.lastModified = new Date().toString();
    }
    save = ()=>{
        return new Promise((resolve, reject)=> {
            let query;
            if (!this.type)
                query = `INSERT INTO USER_SETTINGS SET ? ON DUPLICATE KEY UPDATE valueInt=${this.valueInt}, lastModified="${this.lastModified}"`
            else 
                query = `INSERT INTO USER_SETTINGS SET ? ON DUPLICATE KEY UPDATE valueStr="${this.valueStr}", lastModified="${this.lastModified}"`
            connection.query(query, this, (err, result)=> {
                if (err)    reject(err);
                resolve (result);
            });
        });
    }
}
UserSettings.find = (filters, columns=["*"])=> {
    return new Promise((resolve, reject)=>{
        let query=`SELECT ${columns.join(', ')} FROM USER_SETTINGS WHERE `, len = Object.keys(filters).length;
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
UserSettings.delete = (filters)=> {
    return new Promise((resolve, reject)=>{
        let query=`DELETE FROM USER_SETTINGS WHERE `, len = Object.keys(filters).length;
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
module.exports = UserSettings;