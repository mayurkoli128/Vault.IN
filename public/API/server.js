import {genPasswordHash, generateRSAKey, genCryptoKey, encrypt, decrypt, wrapDkey, unwrapDkey, importCryptoKey} from '../lib/index.js';
import {makeRequest} from '../API/xhr.js';

let db = window.location.origin;
export function retrieveUser(username) {
    return makeRequest({method: "GET", url: `${db}/user/${username}`});
}
export async function getPublicKey(username) {
    let user = await retrieveUser(username);
    return user ;
}
export async function addUser(user) {
    await genCryptoKey(user.password);
    let keys = await generateRSAKey();
    user.password = await genPasswordHash(user.password);
    user.confirmPassword = await genPasswordHash(user.confirmPassword);
    user.publicKey = keys.publicKey;
    user.privateKey = keys.privateKey;
    return makeRequest({method: "POST", url: `${db}/join/register`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: user});
}
export function deleteSecret(secretId) {
    return makeRequest({method: "DELETE", url: `${db}/secrets/${secretId}`});
}
export async function getSecret(secretId, wantCipher = false) {
    let {user, secret} = (await makeRequest({method: "GET", url: `${db}/secrets/${secretId}`})).response;
    let encryptedData = {
        login: secret.login,
        password: secret.password,
        websiteAddress: secret.websiteAddress,
        note: secret.note
    }
    if (wantCipher) {
        return {secret: encryptedData, title: secret.title, rights: secret.rights};
    }
    return {secret: await decrypt(encryptedData, secret.dKey, user.privateKey), title: secret.title, rights: secret.rights};
}
export function getAllSecret() {
    return makeRequest({method: "GET", url: `${db}/secrets/`});
}
export async function addSecret(secret, username) {
    // username, publicKey...
    username=username.trim();
    let title = secret.title;
    delete secret.title;
    const {user} = (await makeRequest({method: "GET", url: `${db}/user/${username}`})).response;
    let encryptedData = await encrypt(secret, user.publicKey);
    encryptedData.secret.title = title;
    return makeRequest({method: "POST", url: `${db}/secrets/add`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: encryptedData});
}
export async function updateSecret(secret, secretId, username) {
    // username, publicKey...
    username=username.trim();
    let {user} = (await makeRequest({method: "GET", url: `${db}/user/${username}`})).response,
    {dKey} = (await makeRequest({method: "GET", url: `${db}/secrets/${secretId}`})).response.secret;
    let {aesKey, iv} = await unwrapDkey(user.privateKey, dKey);
    secret = await encrypt(secret, user.publicKey, {aesKey: aesKey, iv: iv});
    return makeRequest({method: "PATCH", url: `${db}/secrets/${secretId}/data`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: secret.secret});
}
export async function shareSecret(secretId, username, rights) {
    // request for public key.
    username = (username != ''? username: 'n0').trim();
    const {friend, user} = (await makeRequest({method: "GET", url: `${db}/user/${username}/`})).response,
    secret = (await makeRequest({method: "GET", url: `${db}/secrets/${secretId}`})).response.secret;

    let {aesKey, iv} = await unwrapDkey(user.privateKey, secret.dKey);
    friend.publicKey =  await importCryptoKey(friend.publicKey);
    let friendDkey = await wrapDkey(friend.publicKey, aesKey, iv),
    metadata = {userId: friend.id, secretId: secretId, dKey: friendDkey, rights: rights};
    
    return makeRequest({method: "POST", url: `${db}/secrets/share`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: metadata});
}
export async function unshareSecret() {

} 
export async function getOwners(secretId) {
    const {user, owners} = (await makeRequest({method: "GET", url: `${db}/secrets/owners/${secretId}/`})).response;
    return {user, owners};
}