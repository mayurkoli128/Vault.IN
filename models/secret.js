const connection = require('../startup/db');
const Data = require('../models/secretRecord');
const Metadata = require('../models/metadata');
const SecretRecord = require('../models/secretRecord');
require('dotenv').config();

class Secret {
    constructor(secret) {
        this.data = secret.data;
        this.metadata = secret.metadata
    }
    save = ()=>{
        return new Promise((resolve, reject)=> {
            connection.beginTransaction(async (err)=> {
                if (err)    reject(err);
                try {
                    await this.data.save();
                    connection.query(`SELECT LAST_INSERT_ID() AS ID`, async (error, result)=> {
                        if (error) {
                            connection.rollback(function() {
                                reject(error);
                            });
                        }
                        this.metadata.secretId = result[0].ID;
                        await this.metadata.save();
                        connection.commit((err)=> {
                            if (err) {
                                connection.rollback(function() {
                                    reject(error);
                                });
                            }
                            resolve('Transaction Complete');
                        });
                    });
                } catch (error) {
                    connection.rollback(function() {
                        reject(error);
                    });
                }
            });
        });
    }
}
Secret.find = (filters, columns=["*"])=> {
    return new Promise((resolve, reject)=>{
        let query=`SELECT ${columns.join(', ')} FROM SECRET JOIN USER ON SECRET.userId = USER.id JOIN SECRET_DATA_RECORD ON SECRET.secretId = SECRET_DATA_RECORD.id WHERE `;
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
Secret.delete = (id)=> {
     return new Promise((resolve, reject)=> {
            connection.beginTransaction(async (err)=> {
                if (err)    reject(err);
                try {
                    await Metadata.delete({secretId: id});
                    await Data.delete({id: id});
                    connection.commit((err)=> {
                        if (err) {
                            connection.rollback(function() {
                                reject(error);
                            });
                        }
                        resolve('Transaction Complete');
                    });
                } catch (error) {
                    connection.rollback(function() {
                        reject(error);
                    });
                }
            });
        });
}
Secret.findAndModify = (filters, secret)=> {
    return new Promise((resolve, reject)=>{
        let query=`UPDATE SECRET SET ? WHERE `;
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
Secret.unshareOperation = (bundle)=> {
    return new Promise((resolve, reject)=> {
        connection.beginTransaction(async (err)=> {
            if (err)    reject(err);
            try {
                // delete friend from database...
                let result = await Metadata.delete({secretId: bundle.secretId, userId: bundle.friendId});
                let dKeys = bundle.dKeys;
                // update dKey for remaining users...
                let arr = Object.entries(dKeys).map(([id, key])=> {
                    return Promise.all([Metadata.findAndModify({secretId: bundle.secretId, userId: id}, {dKey: key})]);
                });
                result = await Promise.all(arr);
                // update secret data...
                result = await SecretRecord.findAndModify({id: bundle.secretId}, bundle.secret);
                connection.commit((err)=> {
                    if (err) {
                        connection.rollback(function() {
                            reject(error);
                        });
                    }
                    resolve('Transaction Complete');
                });
            } catch (error) {
                connection.rollback(function() {
                    reject(error);
                });
            }
        });
    });
};
module.exports = Secret;