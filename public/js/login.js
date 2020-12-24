import {genPasswordHash, genCryptoKey} from './index.js';

const form = document.getElementById('form');
form.onsubmit = async()=> {
    const password = document.getElementById('password');
    genCryptoKey(password.value);
    password.value = await genPasswordHash(password.value);
    form.submit();
}