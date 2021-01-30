import {genPasswordHash, genCryptoKey} from '../lib/index.js';

const form = document.getElementById('form');
form.addEventListener('submit', async(event)=> {
    event.preventDefault();
    const password = document.getElementById('password');
    await genCryptoKey(password.value);
    password.value = await genPasswordHash(password.value);
    form.submit();
});
