import {resetState} from './userSetting.js';
import {makeRequest} from './xhr.js';
// persist the secret so that we can use it for first time token validation later. 

let totpSecret;
//2-factor authentication
async function activate2FA() {
    $('#qrcode-modal').modal('show');
    document.getElementById('passcode').style.borderColor='rgb(145, 143, 143)';
    document.getElementById('passcodeHelp').innerText="";

    try {
        let res = await makeRequest({method: "GET", url: "../settings/2fa/generate"});
        res = JSON.parse(res);
        totpSecret = res.base32secret;
        document.getElementById('qrcode').src = res.qrcode;
    } catch (error) {
        // ohh no! something went wrong.
        console.log('Error: '+error);
    }
}
async function deactivate2FA() {
    let name="2fa";
    try {
        let res = await makeRequest({method: "DELETE", url: `../settings/2fa/${name}`});
        res = JSON.parse(res);
    } catch (error) {
        // ohh no! something went wrong.
        console.log('Error: '+error);
    }
}
window.twoFAuth = (obj)=> {
    if (!obj.checked) {
        deactivate2FA();
        return ;
    }
    obj.checked=false;
    activate2FA();
}

let form2fa = document.getElementById('activate-2fa');
form2fa.addEventListener('submit', async(event)=> {
    event.preventDefault();
    let passcode_msg = document.getElementById('passcodeHelp');
    try {
        let res = await makeRequest({method: "POST", url: `../settings/2fa/verify`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: {name: '2fa', type: true, userToken: form2fa.elements[0].value, value_str: totpSecret}});
        $('#qrcode-modal').modal('hide');
        resetState();
    } catch (error) {
        // ohh no! something went wrong.
        let res = JSON.parse(error.response)
        passcode_msg.style.color = 'red';
        passcode_msg.innerText = res.message;
        form2fa.elements[0].style.borderColor="red";
    }
});