
// WARNING: implementation may vary according setting type
let counter = document.getElementById('auto-logout-counter');
export function resetState() {
    const  xhr = new XMLHttpRequest(), method="GET", url = `../settings/`;
    xhr.open(method, url, true);
    xhr.onreadystatechange = ()=> {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const status = xhr.status;
            if (status === 0 || (status >= 200 && status < 400)) {
                const settings = JSON.parse(xhr.responseText).settings;
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
            }
        }
    }
    xhr.onerror=()=> {};
    xhr.send();
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
