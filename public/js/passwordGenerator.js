import {Uint8ArrayToBase64} from './index.js'

const key = document.getElementById('key');
key.addEventListener('click', ()=> {
    const pass = document.getElementById('s-password');
    const string = Uint8ArrayToBase64(crypto.getRandomValues(new Uint8Array(16)));
    pass.value = string;
});