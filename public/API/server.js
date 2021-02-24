import {
    genPasswordHash, 
    generateRSAKey, 
    genCryptoKey, 
    encrypt, 
    decrypt, 
    wrapDkey, 
    unwrapDkey, 
    importCryptoKey,
    wrapPrivateKey,
    unwrapPrivateKey,
    getAeskey
} from '../lib/index.js';
import {makeRequest} from '../API/xhr.js';

const db = window.location.origin;
export async function retrieveUser(username) {
    const {user, friend} = (await makeRequest({method: "GET", url: `${db}/user/${username}`})).response;
    return {user, friend};
}
export async function addUser(user) {
    await genCryptoKey(user.password);
    const keys = await generateRSAKey();
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
    const {user, secret} = (await makeRequest({method: "GET", url: `${db}/secrets/${secretId}`})).response;
    const encryptedData = {
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
export async function getAllSecret() {
    const {secrets, user} = (await makeRequest({method: "GET", url: `${db}/secrets/`})).response;
    return {secrets, user};
}
export async function getOwners(secretId) {
    const {user, owners} = (await makeRequest({method: "GET", url: `${db}/secrets/owners/${secretId}/`})).response;
    return {user, owners};
}
export async function addSecret(secret, username) {
    // username, publicKey...
    username=username.trim();
    const data = {
        login: secret.login,
        websiteAddress: secret.websiteAddress,
        note: secret.note,
        password: secret.password,
    }
    const {user} = (await retrieveUser(username));
    user.publicKey = await importCryptoKey(user.publicKey);
    const aesKey = await getAeskey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await encrypt(data, iv, aesKey);
    encryptedData.title = secret.title;
    const dKey = await wrapDkey(user.publicKey, aesKey, iv);
    return makeRequest({method: "POST", url: `${db}/secrets/add`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: {secret: encryptedData, dKey: dKey}});
}
export async function updateSecret(secret, secretId, username) {
    // username, publicKey...
    username=username.trim();
    secretId=secretId.trim();
    const {user} = (await retrieveUser(username));
    const {dKey} = (await makeRequest({method: "GET", url: `${db}/secrets/${secretId}`})).response.secret;
    const {aesKey, iv} = await unwrapDkey(user.privateKey, dKey);
    secret = await encrypt(secret, iv, aesKey);
    return makeRequest({method: "PATCH", url: `${db}/secrets/${secretId}/data`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: secret});
}
export async function changeRights(rights, friendName, secretId) {
    const metadata = {friendName: friendName, rights: rights};
    return makeRequest({method: "PATCH", url: `${db}/secrets/${secretId}/metadata`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: metadata});
}
export async function changeMasterPassword(currUser, password) {
    currUser=currUser.trim();
    // retrive private key of user..
    const {user} = await retrieveUser(currUser);
    // unwrap it using current password
    let privateKey = await unwrapPrivateKey(user.privateKey);
    await genCryptoKey(password);
    privateKey = await wrapPrivateKey(privateKey);
    const passwordHash = await genPasswordHash(password);   
    return makeRequest({method: "PATCH", url: `${db}/user/edit-account/password`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: {password: passwordHash, privateKey: privateKey}});
}
export async function shareSecret(secretId, friendName, rights) {
    // request for public key.
    friendName = (friendName != '' ? friendName: 'n0').trim();
    const {friend, user} = await retrieveUser(friendName),
    {dKey} = (await makeRequest({method: "GET", url: `${db}/secrets/${secretId}`})).response.secret;
    const {aesKey, iv} = await unwrapDkey(user.privateKey, dKey);
    friend.publicKey =  await importCryptoKey(friend.publicKey);
    const friendDkey = await wrapDkey(friend.publicKey, aesKey, iv),
    metadata = {userId: friend.id, secretId: secretId, dKey: friendDkey, rights: rights};
    return makeRequest({method: "POST", url: `${db}/secrets/share`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: metadata});
}
export async function unshareSecret(secretId, friendName) {
    // get the secret with secretId & decrypt 
    const {secret} = await getSecret(secretId); 
    // encrypt the secret with new aes-key...
    const aesKey = await getAeskey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await encrypt(secret, iv, aesKey);
    const {owners} = await getOwners(secretId);
    // get all the owners public key...
    let publicKeys = [];
    for (let i = 0; i < owners.length; i++) {
        if (owners[i].username == friendName)   continue ;
        let publicKey = owners[i].publicKey;
        publicKeys.push(Promise.all([owners[i].id, importCryptoKey(publicKey)]));
    }
    // wrap the new aes-key using public of each owner and assign the new aes bundle to each owner...
    publicKeys = Object.fromEntries(await Promise.all(publicKeys));
    let dKeys = Object.entries(publicKeys).map(([key, publicKey])=> {
        return Promise.all([key, wrapDkey(publicKey, aesKey, iv)]);
    });
    dKeys = Object.fromEntries(await Promise.all(dKeys));
    // and these complete updation needs to atomic...
    return makeRequest({method: "PATCH", url: `${db}/secrets/unshare/`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: {secret: encryptedData, dKeys: dKeys, secretId: secretId, friendName: friendName}});
} 
