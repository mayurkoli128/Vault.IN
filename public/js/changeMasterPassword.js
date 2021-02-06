import {changeMasterPassword} from '../API/server.js';
import { show } from '../partials/messages.js';

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

const changePasswordForm = document.getElementById('change-password-form');
changePasswordForm.addEventListener('submit', async (event)=> {
    event.preventDefault();
    let btn = document.getElementById('change-pass-button');
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" style="vertical-align: middle;" role="status" aria-hidden="true"></span>Processing...`
    const password = document.getElementById('c-password').value;
    try {
        let currUser = document.getElementById('username').innerText;
	    currUser = currUser.substr(10);
        const res = await changeMasterPassword(currUser, password);
        btn.innerHTML="CHANGE IT";
        show(res.response.message, "success", "change-password-msg");
        changePasswordForm.reset();
    } catch (error) {
        // ohh no! Something went wrong...
        // window.location.reload();
        console.log(error);
    }
});

