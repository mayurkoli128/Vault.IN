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

function getDataEncoding(data) {
    const enc = new TextEncoder();
    return enc.encode(data);
}
function getDataDecoding(data) {
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
async function genAesKey(passwordCryptoKey, salt) {
    return await crypto.subtle.deriveKey(
        {
            name:"PBKDF2",
            salt,
            iterations: 250000,
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
export async function decrypt(message) {
    const salt = base64ToUint8Array(message.substr(0, 44));
    const iv = base64ToUint8Array(message.substr(44, 16));
    const ciphertext = base64ToUint8Array(message.substr(60));
    let passwordCryptoKey = (await getCryptoKey(1)).cryptoObj;
    const aeskey = await genAesKey(passwordCryptoKey, salt);
    const plaintext = await crypto.subtle.decrypt({
        name: "AES-GCM",
        iv
    }, aeskey, ciphertext);
    return (getDataDecoding(plaintext));
}
export async function encrypt(message) {
    const dataInBytes = getDataEncoding(message);
    // get weak password crypto key get it from indexedDB if exist
    let passwordCryptoKey = (await getCryptoKey(1)).cryptoObj;
    // derive an aes key from passwordKye 
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const aeskey = await genAesKey(passwordCryptoKey, salt);
    // generate iv for data encryption....
    const iv = crypto.getRandomValues(new Uint8Array(12));
    // generate encrypted data using iv+aeskey+datainBytes 
    const encryptedContent = await crypto.subtle.encrypt({
        name: "AES-GCM",
        iv}, aeskey, dataInBytes
    );
    const encryptedBytes = new Uint8Array(encryptedContent);

    //testing
    const res = Uint8ArrayToBase64(salt)+Uint8ArrayToBase64(iv)+Uint8ArrayToBase64(encryptedBytes);
    return res ;
}
// indexedDB store-CryptoKeys implementation....

// CRUD 1) CREATE:
async function storeCryptoKey(cryptObj) {
    try {
        const db = await connect({dbName:'keyDB', dbVersion:1, store: {name: 'crypto_key', key: 'id'}})
        await save(db, 'crypto_key', {id: 1, cryptoObj: cryptObj});
    } catch (error) {
        throw new Error(error);        
    }
}
// CRUD 2) READ
async function getCryptoKey(key) {
    try {
        const db = await connect({dbName:'keyDB', dbVersion:1, store: {name: 'crypto_key', key: 'id'}});
        const res = await findOne(db, 'crypto_key', key);
        return res;
    } catch (error) {
        throw new Error(error);
    }
}

// CRUD 3) DELETE
async function deleteCryptoKey(key) {
    try {
        const db = await connect({dbName:'keyDB', dbVersion:1, store: {name: 'crypto_key', key: 'id'}})
        await remove(db, 'crypto_key', key);
    } catch (error) {
        throw new Error(error);
    }
}
// CRUD 4) UPDATE
function updateCryptoKey(key) {}
