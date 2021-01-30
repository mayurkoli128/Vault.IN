const connection = require('../startup/db');
require('dotenv').config();

class PaymentSecret {
    constructor(pSecret) {
        this.cardTitle = pSecret.cardTitle;
        this.cardNumber = pSecret.cardNumber;
        this.securityCode = pSecret.securityCode;
        this.cardHolderName = pSecret.cardHolderName;
        this.billingAddress = pSecret.billingAddress;
        this.expirationMonth = pSecret.expirationMonth;
        this.expirationYear = pSecret.expirationYear;
        this.userId = pSecret.userId;
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