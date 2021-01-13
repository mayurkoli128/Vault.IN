import { makeRequest } from "./xhr.js";

// WARNING: implementation may vary according setting type
let counter = document.getElementById('auto-logout-counter');
export async function resetState() {
    try {
        let res = await makeRequest({method: 'GET', url: '../settings/'})
        const settings = JSON.parse(res).settings;
        settings.forEach((setting)=> {
            let state=document.getElementById(setting.name) ;
            if (setting.name == 'autoLogout') {
                counter.value = setting.value_int;
                if (counter.value!=0) {
                    state.checked=true;
                    $('#messages').modal('show');
                    startTimer(parseInt(counter.value));
                }
            } else 
                if (setting.value_str != 'false')    state.checked=true;   
        });
    } catch (error) {
        // ohh no! something went wrong...
        console.log('Error: '+error);
    }
};
resetState();
let timer_id;
export function startTimer(timeout) {
    timer_id = setTimeout(() => {
        window.location = '../auth/logout';
    }, 1000*10*timeout);
}
export function stopTimer(timeout) {
    clearTimeout(timer_id);
}
