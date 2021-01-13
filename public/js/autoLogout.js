
import {startTimer, stopTimer} from './userSetting.js';
import {makeRequest} from './xhr.js';
// Auto-logout....
let counter = document.getElementById('auto-logout-counter');
counter.addEventListener('input', async ()=> {
    stopTimer();
    // costmized time-interval set by user when he/she is logged in
    let cv = counter.value ;
    if (!cv)    cv = 0;
    if (cv != 0)    startTimer(parseInt(cv));
    try {
        let res = await makeRequest({method: "POST", url: "../settings/", data: {name: "autoLogout", type: false, value_int: cv}, headers: {"Content-Type": "application/json;charset=UTF-8"}});
    } catch (error) {
        // ohh no! something went wrong.
        console.log('Error: '+error);
    }
});
window.autoLogout = (obj)=> {
    if (obj.checked)    counter.disabled=false;
    else{ 
        counter.disabled=true;
        counter.value=0;
        counter.dispatchEvent(new Event("input"));
    }
}
