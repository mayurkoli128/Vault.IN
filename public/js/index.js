import {
    connect, 
    findOne, 
    save, 
    remove} 
from './indexeddb.js';

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
        }, passwordCryptoKey, {name:'AES-GCM', length: 256}, false, ['encrypt']
    );
}
function uint8ArrayToBase64(binary) {
    return window.btoa(String.fromCharCode.apply(null, binary));
}   
async function encrypt(message) {
    const dataInBytes = getDataEncoding(message);
    // get weak password crypto key get it from indexedDB if exist
    let passwordCryptoKey = (await getCryptoKey(1)).cryptoObj;
    console.log(passwordCryptoKey);
    // derive an aes key from passwordKye 
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const aeskey = await genAesKey(passwordCryptoKey, salt);
    console.log(aeskey);
    // generate iv for data encryption....
    const iv = crypto.getRandomValues(new Uint8Array(12));
    // generate encrypted data using iv+aeskey+datainBytes 
    const encryptedContent = await crypto.subtle.encrypt({
        name: "AES-GCM",
        iv}, aeskey, dataInBytes
    );
    const encryptedBytes = new Uint8Array(encryptedContent);

    //testing
    const res = uint8ArrayToBase64(encryptedBytes)+uint8ArrayToBase64(iv)+uint8ArrayToBase64(encryptedBytes);
    res ;
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

encrypt('mayur');