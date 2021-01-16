import {
    connect, 
    findOne, 
    save, 
    remove} 
from './indexedDB.js';

// pasword hashing/generating digest(hash or ciphertext using sha-256 hashing algo)
export async function digestMessage(data) {
    const msgUint8 = new TextEncoder().encode(data);                           // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
}
export async function genPasswordHash(password) {
    const digestHex = await digestMessage(password);
    return digestHex;
}
// generating derived key for encryption/decryption....

export function getDataEncoding(data) {
    const enc = new TextEncoder();
    return enc.encode(data);
}
export function getDataDecoding(data) {
    const dec = new TextDecoder('utf-8');
    return dec.decode(new Uint8Array(data));
}
export async function genCryptoKey(password) {
    const passwordInBytes = getDataEncoding(password);
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        passwordInBytes,
        "PBKDF2",
        false,
        // to derive key
        ["deriveKey"]
    );
    deleteCryptoKey(1);
    storeCryptoKey(cryptoKey);
}
export async function genAesKey(salt) {
    let passwordCryptoKey = (await getCryptoKey(1)).cryptoObj;
    return await crypto.subtle.deriveKey(
        {
            name:"PBKDF2",
            salt,
            iterations: 200000,
            hash: {name: 'SHA-256'}
            // which type of key you want to generate {name:'AES-GCM', length: 256}
        }, passwordCryptoKey, {name:'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']
    );
}
export function Uint8ArrayToBase64(data) {
    return window.btoa(String.fromCharCode.apply(null, data));
}   
export function base64ToUint8Array(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return new Uint8Array(bytes.buffer);
}
export async function decrypt(secret) {
    // first extract salt, iv from any of the field eg.login

    // generate iv for data decryption....
    const iv = base64ToUint8Array(secret['login'].substr(44, 16));
    // generate salt for aes key generation...
    const salt = base64ToUint8Array(secret['login'].substr(0, 44));
    // derive an aes key using passwordCryptoKey 
    const aeskey = await genAesKey(salt);
    
    let decryptedSecret = Object.fromEntries(await Promise.all(Object.entries(secret).map(([key, value])=> {
        if (key === 'id')    return [key, value];
        // generate encrypted data using iv+aeskey+datainBytes 
        const ciphertext = base64ToUint8Array(value.substr(60));
        return Promise.all([key, 
            crypto.subtle.decrypt({
                name: "AES-GCM",
                iv
            }, aeskey, ciphertext)
        ]);
    })));
    for (let [key, value] of Object.entries(decryptedSecret)) {
        if (key !== 'id') 
            decryptedSecret[key] = getDataDecoding(value);
    }
    return decryptedSecret;
}
export async function encrypt(secret) {
    // generate iv for data encryption....
    const iv = crypto.getRandomValues(new Uint8Array(12));
    // generate salt for aes key generation...
    const salt = crypto.getRandomValues(new Uint8Array(32));
    // derive an aes key using passwordCryptoKey 
    const aeskey = await genAesKey(salt);

    // now encrypt all the fields of a secret (dataInBytes + iv + aesKey)
    let encryptedSecret = Object.fromEntries(await Promise.all(Object.entries(secret).map(([key, value])=> {
        if (key === 'id')    return [key, value];
        const dataInBytes = getDataEncoding(value);
        // generate encrypted data using iv+aeskey+datainBytes 
        return Promise.all([key, 
            crypto.subtle.encrypt({
                name: "AES-GCM",
                iv
            }, aeskey, dataInBytes)
        ]);
    })));
    //concate salt and iv together... and send it on server for backup....
    for (let [key, value] of Object.entries(encryptedSecret)) {
        if (key !== 'id') { 
            const encryptedBytes = new Uint8Array(value);
            encryptedSecret[key] = Uint8ArrayToBase64(salt)+Uint8ArrayToBase64(iv)+Uint8ArrayToBase64(encryptedBytes);
        }
    }
    return encryptedSecret;
}
// indexedDB store-CryptoKeys implementation....

// CRUD 1) CREATE:
export async function storeCryptoKey(cryptoObj) {
    try {
        const db = await connect({dbName:'keyDB', dbVersion:1, store: {name: 'crypto_key', key: 'id'}})
        await save(db, 'crypto_key', {id: 1, cryptoObj: cryptoObj});
    } catch (error) {
        throw new Error(error);        
    }
}
// CRUD 2) READ
export async function getCryptoKey(key) {
    try {
        const db = await connect({dbName:'keyDB', dbVersion:1, store: {name: 'crypto_key', key: 'id'}});
        const res = await findOne(db, 'crypto_key', key);
        return res;
    } catch (error) {
        throw new Error(error);
    }
}

// CRUD 3) DELETE
export async function deleteCryptoKey(key) {
    try {
        const db = await connect({dbName:'keyDB', dbVersion:1, store: {name: 'crypto_key', key: 'id'}})
        await remove(db, 'crypto_key', key);
    } catch (error) {
        throw new Error(error);
    }
}
// CRUD 4) UPDATE
function updateCryptoKey(key) {}