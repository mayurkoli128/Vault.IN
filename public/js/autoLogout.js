
import {startTimer, stopTimer} from './userSetting.js';
// Auto-logout....
let counter = document.getElementById('auto-logout-counter');
counter.addEventListener('input', ()=> {
    const  xhr = new XMLHttpRequest(), method="POST", url = `../settings/`;
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = ()=> {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const status = xhr.status;
            if (status === 0 || (status >= 200 && status < 400)) {
                // console.log(xhr.responseText);
            } else {
            }
        }
    }
    stopTimer();
    // costmized time-interval set by user when he/she is logged in
    let cv = counter.value ;
    if (!cv)    cv = 0;
    if (cv != 0)    startTimer(parseInt(cv));
    xhr.onerror=()=> {};
    xhr.send(JSON.stringify({name: "autoLogout", type: false, value_int: cv}));
});
window.autoLogout = (obj)=> {
    if (obj.checked)    counter.disabled=false;
    else{ 
        counter.disabled=true;
        counter.value=0;
        counter.dispatchEvent(new Event("input"));
    }
}