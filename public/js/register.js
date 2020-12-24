import {genPasswordHash} from './index.js';

const form = document.getElementById('form');
form.onsubmit = async ()=> {
    const password = document.getElementById('password');
    const confirm_password = document.getElementById('confirm_password');
    password.value = await genPasswordHash(password.value);
    confirm_password.value = await genPasswordHash(confirm_password.value);
    form.submit();
}