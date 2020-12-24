import {} from './index.js';

const form = document.getElementById('form');
form.onsubmit = ()=> {
    for ( var i = 0; i < form.elements.length; i++ ) {
        var e = form.elements[i];
        console.log(e);
    }
    form.submit();
}
