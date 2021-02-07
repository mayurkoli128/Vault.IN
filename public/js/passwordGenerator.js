import {Uint8ArrayToBase64} from '../lib/index.js'

let key = document.getElementsByClassName('key');
key[0].addEventListener('click', ()=> {
    let pass = document.getElementById('s-password');
    let string = Uint8ArrayToBase64(crypto.getRandomValues(new Uint8Array(30)));
    pass.value = string;
});
key[1].addEventListener('click', ()=> {
    let pass = document.getElementById('u-password');
    let string = Uint8ArrayToBase64(crypto.getRandomValues(new Uint8Array(30)));
    pass.value = string;
});