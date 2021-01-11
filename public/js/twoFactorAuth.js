import {resetState} from './userSetting.js';
// persist the secret so that we can use it for first time token validation later. 

let totpSecret;
//2-factor authentication
function activate2FA() {
    $('#qrcode-modal').modal('show');
    document.getElementById('passcode').style.borderColor='rgb(145, 143, 143)';
    document.getElementById('passcodeHelp').innerText="";
    const  xhr = new XMLHttpRequest(), method="GET", url = `../settings/2fa/generate`;
    xhr.open(method, url, true);
    xhr.onreadystatechange = ()=> {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const status = xhr.status;
            if (status === 0 || (status >= 200 && status < 400)) {
                const res = JSON.parse(xhr.responseText);
                totpSecret = res.base32secret;
                document.getElementById('qrcode').src = res.qrcode;
            } 
        }
    }
    
    xhr.onerror=()=> {};
    xhr.send();
}
function deactivate2FA() {
    const  xhr = new XMLHttpRequest(), method="DELETE", url = `../settings/2fa/2fa`;
    xhr.open(method, url, true);
    xhr.onreadystatechange = ()=> {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const status = xhr.status;
            if (status === 0 || (status >= 200 && status < 400)) {
                const res = JSON.parse(xhr.responseText);
            } 
        }
    }
    xhr.onerror=()=> {};
    xhr.send();
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
form2fa.addEventListener('submit', (event)=> {
    event.preventDefault();
    const  xhr = new XMLHttpRequest(), method="POST", url = `../settings/2fa/verify`;
    let passcode_msg = document.getElementById('passcodeHelp');
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = ()=> {
        // let res = JSON.parse(xhr.responseText);
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const status = xhr.status;
            if (status === 0 || (status >= 200 && status < 400)) {
                const res = JSON.parse(xhr.responseText);
                if (res.ok) {
                    $('#qrcode-modal').modal('hide');
                    resetState();
                }
            } else {
                const res = JSON.parse(xhr.responseText);
                passcode_msg.style.color = 'red';
                passcode_msg.innerText = res.message;
                form2fa.elements[0].style.borderColor="red";
            }
        } 
    }
    xhr.onerror=()=> {};
    xhr.send(JSON.stringify({name: "2fa", type: true, userToken: form2fa.elements[0].value, value_str: totpSecret}));
});