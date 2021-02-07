import {connect, findOne, save, remove} from '../API/indexedDB.js';

const rsaAlg = {
    name: "RSA-OAEP",
    hash: "SHA-256",
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 4096
};
const aesAlg = {
    name: "AES-GCM",
    length: 256,
};
// generating derived key for encryption/decryption....
export function getDataEncoding(data) {
    const enc = new TextEncoder();
    return enc.encode(data);
}
export function getDataDecoding(data) {
    const dec = new TextDecoder('utf-8');
    return dec.decode(new Uint8Array(data));
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
export function bytesToArrayBuffer(bytes) {
    const bytesAsArrayBuffer = new ArrayBuffer(bytes.length);
    const bytesUint8 = new Uint8Array(bytesAsArrayBuffer);
    bytesUint8.set(bytes);
    return bytesAsArrayBuffer;
}
export function genPasswordHash(data) {
    return new Promise(async (resolve, reject)=> {
        try {
            const msgUint8 = new TextEncoder().encode(data);                           // encode as (utf-8) Uint8Array
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
            const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
            resolve(hashHex);
        } catch (error) {
            reject(error);
        }
        
    });
}
export function importCryptoKey(portableJWK) {
    portableJWK = JSON.parse(atob(portableJWK));
    return crypto.subtle.importKey( "jwk", portableJWK, rsaAlg, true, ["wrapKey"]);
}
export async function unwrapPrivateKey(wrappedKey) {
    // generate salt for aes key generation...
    const salt = base64ToUint8Array(wrappedKey.substr(0, 44));
    // generate iv for data decryption....
    const iv = base64ToUint8Array(wrappedKey.substr(44, 16));
    // derive an aes key using passwordCryptoKey 
    const unwrappingKey = await genAesKey(salt);
    aesAlg.iv = iv;
    const wrappedKeyBuffer = bytesToArrayBuffer(base64ToUint8Array(wrappedKey.substr(60)));
    return window.crypto.subtle.unwrapKey("jwk", wrappedKeyBuffer, unwrappingKey, aesAlg, rsaAlg, true, ["unwrapKey"]); 
}
export async function wrapPrivateKey(privateKey) {
    const salt = window.crypto.getRandomValues(new Uint8Array(32));
    const wrappingKey = await genAesKey(salt);
    // wrap private key
    aesAlg.iv = crypto.getRandomValues(new Uint8Array(12));
    const wrappedKey = await crypto.subtle.wrapKey("jwk", privateKey, wrappingKey, aesAlg);
    return  Uint8ArrayToBase64(salt)+Uint8ArrayToBase64(aesAlg.iv)+Uint8ArrayToBase64(new Uint8Array(wrappedKey));
}
export function generateRSAKey() {
    return new Promise(async (resolve, reject)=> {
        let keyPair = await crypto.subtle.generateKey(rsaAlg, true, ["wrapKey", "unwrapKey"]);
        // export private key
        keyPair.privateKey = await wrapPrivateKey(keyPair.privateKey);
        // export public key
        let portableJWK = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
        keyPair.publicKey = btoa((JSON.stringify(portableJWK)));
        resolve (keyPair);
    });
};
export function genCryptoKey(password) {
    return new Promise(async(resolve, reject)=> {
        try {
            const passwordInBytes = getDataEncoding(password);
            const cryptoKey = await crypto.subtle.importKey(
                "raw",
                passwordInBytes,
                "PBKDF2",
                false,
                // to derive an aes key
                ["deriveBits", "deriveKey"]
            );
            await deleteCryptoKey(1);
            await storeCryptoKey(cryptoKey);
            resolve('Crypto key is generated and stored.');
        } catch (error) {
            reject(error);
        }
    });
}
// generate an aes key which will further be use for wraping & unwraping private key...
export function genAesKey(salt) {
    return new Promise(async(resolve, reject)=> {
        try {
            let passwordCryptoKey = (await getCryptoKey(1)).cryptoObj;
            let aesKey = await crypto.subtle.deriveKey(
                {
                    name:"PBKDF2",
                    salt,
                    iterations: 250000,
                    hash: {name: 'SHA-256'}
                }, passwordCryptoKey, aesAlg, false, [ "wrapKey", "unwrapKey" ]
            );
            resolve(aesKey);
        } catch (error) {
            reject(error);
        }
    });
}
export async function unwrapDkey(privateKey, dKey) {
    privateKey = await unwrapPrivateKey(privateKey);
    const iv = base64ToUint8Array(dKey.substr(0, 16));
    const wrappedKey = bytesToArrayBuffer(base64ToUint8Array(dKey.substr(16)));
    const aesKey = await crypto.subtle.unwrapKey("jwk", wrappedKey, privateKey, {name: "RSA-OAEP"}, aesAlg, true, ["encrypt", "decrypt"]);
    return {aesKey: aesKey, iv: iv};
}
export async function wrapDkey(publicKey, aesKey, iv) {
    const wrappedKey = await crypto.subtle.wrapKey("jwk", aesKey, publicKey, {name: "RSA-OAEP"});
    return  Uint8ArrayToBase64(iv)+Uint8ArrayToBase64(new Uint8Array((wrappedKey)));
}
export function decrypt(secret, dKey, privateKey) {
    return new Promise(async(resolve, reject)=> {
        try {
            const {aesKey, iv} = await unwrapDkey(privateKey, dKey);
            secret = Object.fromEntries(await Promise.all(Object.entries(secret).map(([key, value])=> {
                // generate encrypted data using iv+aeskey+datainBytes 
                const ciphertext = base64ToUint8Array(value);
                return Promise.all([key, 
                    crypto.subtle.decrypt({
                        name: "AES-GCM",
                        iv
                    }, aesKey, ciphertext)
                ]);
            })));
            for (let [key, value] of Object.entries(secret)) {
                secret[key] = getDataDecoding(value);
            }
            resolve(secret);
        } catch (error) {
            reject(error);
        }
    });
    
}
export function getAeskey() {
    return crypto.subtle.generateKey(aesAlg, true, ['encrypt', 'decrypt']);
}
export function encrypt(secret, iv, aesKey) {
    return new Promise(async(resolve, reject)=> {
        try {
            // The secret is encrypted using AES-GCM-256 with randomly generated intermediate key.
            secret = Object.fromEntries(await Promise.all(Object.entries(secret).map(([key, value])=> {
                // generate encrypted data using iv+aesKey+datainBytes 
                return Promise.all([key, 
                    crypto.subtle.encrypt({
                        name: "AES-GCM",
                        iv
                    }, aesKey, getDataEncoding(value))
                ]);
            })));
            // arraybuffer to base64
            for (let [key, buffer] of Object.entries(secret)) {
                const encryptedBytes = new Uint8Array(buffer);
                secret[key] = Uint8ArrayToBase64(encryptedBytes);
            }
            resolve(secret);
        } catch (error) {
            reject(error);
        }
    });
}

// indexedDB store-CryptoKeys implementation....

// CRUD 1) CREATE:
export function storeCryptoKey(cryptoObj) {
    return new Promise(async(resolve, reject)=> {
        try {
            const db = await connect({dbName:'keyDB', dbVersion:1, store: {name: 'crypto_key', key: 'id'}})
            await save(db, 'crypto_key', {id: 1, cryptoObj: cryptoObj});
            resolve('Crypto key is store in db');
        } catch (error) {
            reject(error);        
        }
    });
  
}
// CRUD 2) READ
export function getCryptoKey(key) {
    return new Promise(async(resolve, reject)=> {
        try {
            const db = await connect({dbName:'keyDB', dbVersion:1, store: {name: 'crypto_key', key: 'id'}});
            const res = await findOne(db, 'crypto_key', key);
            resolve(res);
        } catch (error) {
            reject(error);
        }
    });
}
// CRUD 3) DELETE
export function deleteCryptoKey(key) {
    return new Promise(async(resolve, reject)=> {
        try {
            const db = await connect({dbName:'keyDB', dbVersion:1, store: {name: 'crypto_key', key: 'id'}})
            await remove(db, 'crypto_key', key);
            resolve('Key is deleted');
        } catch (error) {
            reject(error);
        }
    });
}
// CRUD 4) UPDATE
function updateCryptoKey(key) {}