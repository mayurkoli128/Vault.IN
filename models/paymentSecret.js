const connection = require('../startup/db');
require('dotenv').config();

class PaymentSecret {
    constructor(pSecret) {
        this.card_title = pSecret.card_title;
        this.card_number = pSecret.card_number;
        this.security_code = pSecret.security_code;
        this.card_holder_name = pSecret.card_holder_name;
        this.billing_address = pSecret.billing_address;
        this.expiration_month = pSecret.expiration_month;
        this.expiration_year = pSecret.expiration_year;
        this.user_id = pSecret.user_id;
        this.last_modified = new Date().toString();
    }
    save = ()=>{
        return new Promise((resolve, reject)=> {
            const query = `INSERT INTO PAYMENT_SECRET SET ?`
            connection.query(query, this, (err, result)=> {
                if (err)    reject(new Error('Something failed (Record Insertion) :'+err));
                resolve (result);
            });
        });
    }
}
PaymentSecret.findOne = (val)=> {
    var filter = Object.getOwnPropertyNames(val)[0];
    return new Promise((resolve, reject)=>{
        let query=`SELECT * FROM PAYMENT_SECRET WHERE `, len = Object.keys(filters).length;
        for (const [key, value] of Object.entries(filters)) {
            len--;
            if (len!=0) {
                query += `${key} = "${value}"&&`;
            } else {
                query += `${key} = "${value}"`;
            }
        }
        connection.query(query, (err, result)=>{
            if (err)    reject(new Error('Something failed (Record searching)'+err));
            else resolve(result[0]);
        });
    });
}
module.exports = PaymentSecret;