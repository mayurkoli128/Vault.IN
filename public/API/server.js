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
export async function addSecret(secret, username) {
    // username, publicKey...
    username=username.trim();
    let title = secret.title;
    delete secret.title;
    const res = await makeRequest({method: "GET", url: `${db}/user/${username}`});
    secret = await encrypt(secret, res.response.user.publicKey);
    secret.secret.title = title;
    return makeRequest({method: "POST", url: `${db}/secrets/add`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: secret});
}
export function deleteSecret(secretId) {
    return makeRequest({method: "DELETE", url: `${db}/secrets/${secretId}`});
}
export async function getSecret(secretId, wantCipher = false) {
    const res = await makeRequest({method: "GET", url: `${db}/secrets/${secretId}`});
    if (wantCipher) {
        return res.response.secret;
    }
    let secret = res.response.secret;
    let dKey = secret.dKey;
    delete secret.dKey;
    let title = secret.title;
    delete secret.title;
    let privateKey = res.response.user.privateKey;
    secret = await decrypt(secret, dKey, privateKey);
    secret.title = title;
    return secret;
}
export function getAllSecret() {
    return makeRequest({method: "GET", url: `${db}/secrets/`});
}
export async function updateSecret() {
    // username, publicKey...
    let title = secret.title;
    delete secret.title;
    const res = await makeRequest({method: "GET", url: `${db}/user/${username}`});
    secret = await encrypt(secret, res.response.user.publicKey);
    secret.secret.title = title;
    return makeRequest({method: "PATCH", url: `${db}/secrets/{}`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: secret});
}
export async function shareSecret(secretId, username, rights) {
    // request for public key.
    const res = await makeRequest({method: "GET", url: `${db}/user/${username}/`}),
    friend = res.response.friend,
    user = res.response.user,
    secret = (await makeRequest({method: "GET", url: `${db}/secrets/${secretId}`})).response.secret;

    let {aesKey, iv} = await unwrapDkey(user.privateKey, secret.dKey);
    friend.publicKey =  await importCryptoKey(friend.publicKey);
    let friendDkey = await wrapDkey(friend.publicKey, aesKey, iv),
    metadata = {userId: friend.id, secretId: secretId, dKey: friendDkey, rights: rights};
    
    return makeRequest({method: "POST", url: `${db}/secrets/share`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: metadata});
}
export async function unshareSecret() {

}