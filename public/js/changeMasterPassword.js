import {encrypt, decrypt, genCryptoKey, genPasswordHash} from './index.js';
import {makeRequest} from './xhr.js'
import {startSpinner, stopSpinner} from './loader.js';

const passin = document.getElementById('c-password');
passin.addEventListener('input', ()=> {
    if (document.getElementById('c-confirm-password').value === passin.value) {
        document.getElementById('not-match-warn').style.visibility='hidden';
        document.getElementById('change-pass-button').disabled = false;
    } else {
        document.getElementById('change-pass-button').disabled = true;
        document.getElementById('not-match-warn').style.visibility='visible';
    }
});
const confirmPassin = document.getElementById('c-confirm-password');
confirmPassin.addEventListener('input', ()=> {
    if (document.getElementById('c-password').value === confirmPassin.value) {
        document.getElementById('not-match-warn').style.visibility='hidden';
        document.getElementById('change-pass-button').disabled = false;
    } else {
        document.getElementById('change-pass-button').disabled = true;
        document.getElementById('not-match-warn').style.visibility='visible';
    }
});

function decryptAll(secrets) {
    return Promise.all(secrets.map((secret)=> {
        return decrypt(secret);
    }));
}
function encryptAll(secrets) {
    return Promise.all(secrets.map((secret)=> {
        return encrypt(secret);
    }));
}
function storeSecrets(secrets) {
    return Promise.all(secrets.map((secret)=> {
        return makeRequest({method: "PATCH", url: `../secrets/${secret.id}`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: secret});
    }));
}

const changePasswordForm = document.getElementById('change-password-form');
changePasswordForm.addEventListener('submit', async (event)=> {
    event.preventDefault();
    let btn = document.getElementById('change-pass-button');
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" style="vertical-align: middle;" role="status" aria-hidden="true"></span>Processing...`
    startSpinner();
    const password = document.getElementById('c-password');
    try {
        let res = await makeRequest({method: "GET", url: "../secrets/all"});
        let secrets = JSON.parse(res).secrets;
        const decryptedData =  await decryptAll(secrets);
        // until now we have all decrypted secrets lets encrypt them using new aes key...
        await genCryptoKey(password.value);
        const encryptedData = await encryptAll(decryptedData);
        console.log(encryptedData);
        // store all encrypted data...
        res = await storeSecrets(encryptedData);
        // store new password 
        const passwordHash = await genPasswordHash(password.value);   
        res = await makeRequest({method: "PATCH", url: `../users/edit-account/password`, 
        headers: {"Content-Type": "application/json;charset=UTF-8"}, data: {password: passwordHash}});
        btn.innerHTML="CHANGE IT";
        $('#change-pass-modal').modal('hide');
        changePasswordForm.reset();
        stopSpinner();
    } catch (error) {
        // ohh no! Something went wrong...
        console.log('Error: '+error);
    }
});

