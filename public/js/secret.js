import {encrypt, decrypt} from './index.js';

// add secret
let form = document.getElementById('add-secret');
form.addEventListener('submit', async(event)=> {
  event.preventDefault();
  let secret = {};
  for ( var i = 0; i < form.elements.length; i++) {
      var e = form.elements[i];
      if (e.type === 'submit') continue ;
      if (e.name === 'title'){ secret[e.name] = e.value;continue;}
      secret[e.name] = await encrypt(e.value);
  }
  secret = JSON.stringify(secret);
  const  xhr = new XMLHttpRequest(), method="POST", url = "../secrets/add";
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = ()=> {
      // In local files, status is 0 upon success in Mozilla Firefox
      if(xhr.readyState === XMLHttpRequest.DONE) {
        var status = xhr.status;
        if (status === 1 || (status >= 200 && status < 400)) {
          // The request has been completed successfully
          document.getElementsByClassName('close')[0].click();
          form.reset();
          viewVault();
        } else {
          // Oh no! There has been an error with the request!
          throw new Error('Something failed [SECRET-INSERTION]: '+xhr.responseText);
        }
      }
  };
  xhr.send(secret);
});


window.decryptSecret = function(id) {
  const spinner = document.getElementById('spinner-'+id);
  spinner.style.visibility="visible";

  const  xhr = new XMLHttpRequest(), method="GET", url = `../secrets/${id}`;
  xhr.open(method, url, true);
  xhr.onreadystatechange = async ()=> {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const status = xhr.status;
      if (status === 0 || (status >= 200 && status < 400)) {
        const res = JSON.parse(xhr.responseText);
        if (res.ok) {
          const secret = res.secret[0];
          const form = document.getElementById('update-secret');
          for ( var i = 0; i < form.elements.length; i++) {
            var e = form.elements[i];
            if (e.type === 'submit') continue ;
            if (e.name === 'title'){ e.value = secret[e.name];continue;}
            e.value = await decrypt(secret[e.name]);
          }
        }
        $('#update-secret-modal').modal('show');
        spinner.style.visibility="hidden";
      } else {
        console.log(xhr.responseText);
      }
    }
  }
  xhr.onerror=()=> {};
  xhr.send();
}

window.deleteSecret = function(id) {
  const  xhr = new XMLHttpRequest(), method="DELETE", url = `../secrets/${id}`;
  xhr.open(method, url, true);
  xhr.onreadystatechange = ()=> {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const status = xhr.status;
      if (status === 0 || (status >= 200 && status < 400)) {
        viewVault();
      } else {
        console.log(xhr.responseText);
      }
    }
  }
  xhr.onerror=()=> {};
  xhr.send();
}
window.viewVault = function() {
  const  xhr = new XMLHttpRequest(), method="GET", url = "../secrets/";
  xhr.open(method, url, true);
  xhr.onreadystatechange = ()=> {
      // In local files, status is 0 upon success in Mozilla Firefox
      if(xhr.readyState === XMLHttpRequest.DONE) {
        var status = xhr.status;
        if (status === 0 || (status >= 200 && status < 400)) {
          // The request has been completed successfully
          const res = JSON.parse(xhr.responseText);
          if (res.ok) {
            let all="", secrets = res.secrets;
            secrets.forEach((secret)=> {
              all += `<tr class="table-row">
                      <th scope="row">${secret.id}</th>
                      <td onclick="decryptSecret(this.id)" id= "${secret.id}">
                      <i class="fas fa-spinner fa-spin fa-2x" id="spinner-${secret.id}" style="visibility: hidden;"></i>
                      <span class="material-icons" style="vertical-align: bottom;">text_snippet</span>
                      ${secret.title}</td>
                      <td>${secret.last_modified.slice(0, -22)}</td>
                      <td>
                      <div class="btn-group">
                        <span class="material-icons" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          more_vert
                        </span>
                        <div class="dropdown-menu">
                          <a class="dropdown-item">Show</a>
                          <a class="dropdown-item" onclick="deleteSecret(this.name);" data-toggle="modal" data-target="#confirm-delet" name=${secret.id}>Delete</a>
                        </div>
                      </div>
                    </td>
                  </tr>`;
            });
            const tbody = document.getElementById('all-secrets');
            tbody.innerHTML = all;
          }
        } else {
          // Oh no! There has been an error with the request!
          throw new Error('Something failed [SECRET-FETCHING]'+ xhr.responseText);
        }
      }
  };
  xhr.onerror=()=>{};
  xhr.send();
}
viewVault();

