// user feture activation settings...

// Auto-logout....
let counter = document.getElementById('auto-logout-counter'), timer_id;
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
    clearTimeout(timer_id);
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

// Short-Login
window.shortLogin = (obj)=> {
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
    xhr.onerror=()=> {};
    xhr.send(JSON.stringify({name: "shortLogin", type: true, value_str: obj.checked.toString()}));
}

//2-factor authentication
window.twoFAuth = (obj)=> {
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
    xhr.onerror=()=> {};
    xhr.send(JSON.stringify({name: "2fa", type: true, value_str: obj.checked.toString()}));
}

// WARNING: implementation may vary according setting type
window.resetState = function() {
    const  xhr = new XMLHttpRequest(), method="GET", url = `../settings/`;
    xhr.open(method, url, true);
    xhr.onreadystatechange = ()=> {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const status = xhr.status;
            if (status === 0 || (status >= 200 && status < 400)) {
                const settings = JSON.parse(xhr.responseText);
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
                        if (setting.value_str == 'true')    state.checked=true;   
                });
            } else {
            }
        }
    }
    xhr.onerror=()=> {};
    xhr.send();
}();

function startTimer(timeout) {
    timer_id = setTimeout(() => {
        window.location = '../auth/logout';
    }, 1000*10*timeout);
}
