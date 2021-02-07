import {makeRequest} from '../API/xhr.js';

let db = window.location.origin;
// WARNING: implementation may vary according setting type
let counter = document.getElementById('auto-logout-counter');
export async function resetState() {
    try {
        let res = await makeRequest({method: 'GET', url: '../settings/'})
        const settings = res.response.settings;
        // 1) auto logout
        // 2) totp
        // 3) short login
        settings.forEach((setting)=> {
            let state=document.getElementById(setting.name) ;
            if (setting.name == 'autoLogout') {
                counter.value = setting.valueInt;
                if (counter.value!=0) {
                    state.checked=true;
                    $('#messages').modal('show');
                    startTimer(parseInt(counter.value));
                }
            } else 
                if (setting.valueStr != 'false')    state.checked=true;   
        });
    } catch (error) {
        // ohh no! something went wrong...
        console.log(error);
    }
};
resetState();
let timerId;
export function startTimer(timeout) {
    timerId = setTimeout(() => {
        window.location = `${db}/logout`;
    }, 1000*60*timeout);
}
export function stopTimer(timeout) {
    clearTimeout(timerId);
}
