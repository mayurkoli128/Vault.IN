import {encrypt, decrypt} from './index.js';
import {stopSpinner, startSpinner} from './loader.js';

// add secret
let insertForm = document.getElementById('add-secret');
insertForm.addEventListener('submit', async(event)=> {
  event.preventDefault();
  let secret = {};
  for ( var i = 0; i < insertForm.elements.length; i++) {
      var e = insertForm.elements[i];
      if (e.type === 'submit') continue ;
      if (e.name === 'title'){ secret[e.name] = e.value;continue;}
      secret[e.name] = await encrypt(e.value);
  }
  secret = JSON.stringify(secret);
  const  xhr = new XMLHttpRequest(), method="POST", url = "../secrets/add";
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = ()=> {
      // In local files, status is 0 upon success in Mozilla Firefox
      if(xhr.readyState === XMLHttpRequest.DONE) {
        var status = xhr.status;
        if (status === 1 || (status >= 200 && status < 400)) {
          // The request has been completed successfully
          document.getElementsByClassName('close')[0].click();
          insertForm.reset();
          viewVault();
        } else {
          // Oh no! There has been an error with the request!
          window.location='../auth/logout/';
        }
      }
  };
  xhr.send(secret);
});

// show-update secret
let rwForm = document.getElementById('update-secret');
window.decryptSecret = function(id) {
  startSpinner();
  document.getElementById('head-id').innerHTML=id;
  const  xhr = new XMLHttpRequest(), method="GET", url = `../secrets/${id}`;
  xhr.open(method, url, true);
  xhr.onreadystatechange = async ()=> {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const status = xhr.status;
      const res = JSON.parse(xhr.responseText);
      if (status === 0 || (status >= 200 && status < 400)) {
        if (res.ok) {
          const secret = res.secret[0];
          for ( var i = 0; i < rwForm.elements.length; i++) {
            var e = rwForm.elements[i];
            if (e.type === 'submit' || e.type === 'button') continue ;
            if (e.name === 'title'){ e.value = secret[e.name];continue;}
            e.value = await decrypt(secret[e.name]);
          }
        }
        stopSpinner();
        $('#update-secret-modal').modal('show');
      } else {
        window.location='../auth/logout/';
      }
    }
  }
  xhr.onerror=()=> {};
  xhr.send();
}

// delete secret
window.deleteSecret = function(id) {
  if (!confirm('Are you sure you want to delete the secret permanently, Continue ?')) return ;
  startSpinner();
  const  xhr = new XMLHttpRequest(), method="DELETE", url = `../secrets/${id}`;
  xhr.open(method, url, true);
  xhr.onreadystatechange = ()=> {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const status = xhr.status;
      if (status === 0 || (status >= 200 && status < 400)) {
        stopSpinner();
        viewVault();
      } else {
        console.log(xhr.responseText);
        window.location='../auth/logout/';
      }
    }
  }
  xhr.onerror=()=> {};
  xhr.send();
}

// view complete vault
window.viewVault = function() {
  startSpinner();
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
                      <span class="material-icons" style="vertical-align: bottom;">text_snippet</span>
                      ${secret.title}</td>
                      <td>${secret.last_modified.slice(0, -22)}-${res.username}</td>
                      <td>
                      <div class="btn-group">
                        <span class="material-icons" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          more_vert
                        </span>
                        <div class="dropdown-menu">
                          <a class="dropdown-item" name="${secret.id}" onclick="decryptSecret(this.name)">Show</a>
                          <a class="dropdown-item" onclick="deleteSecret(this.name);" data-toggle="modal" data-target="#confirm-delet" name=${secret.id}>Delete</a>
                        </div>
                      </div>
                    </td>
                  </tr>`;
            });
            const tbody = document.getElementById('all-secrets');
            tbody.innerHTML = all;
            stopSpinner();
          } 
        } else {
          window.location='../auth/logout/';
        }
      }
  };
  xhr.onerror=()=>{};
  xhr.send();
}
viewVault();

/// update only modified fields...
let assing_id=-1;
rwForm.addEventListener('submit', async (event)=> {
  event.preventDefault();
  let secret = {};
  for ( var i = 0; i < rwForm.elements.length; i++) {
      var e = rwForm.elements[i];
      if (e.type === 'submit' || e.type === 'button') continue ;
      if (e.name === 'title'){ secret[e.name] = e.value;continue;}
      secret[e.name] = await encrypt(e.value);
  }
  secret = JSON.stringify(secret);
  const  xhr = new XMLHttpRequest(), method="PATCH", url = `../secrets/${assing_id}`;
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = ()=> {
      // In local files, status is 0 upon success in Mozilla Firefox
      if(xhr.readyState === XMLHttpRequest.DONE) {
        var status = xhr.status;
        if (status === 1 || (status >= 200 && status < 400)) {
          // The request has been completed successfully
          document.getElementsByClassName('close')[1].click();
          viewVault();
          const obj = document.getElementById('secretUpdate');
          obj.disabled = true;
        } else {
          // Oh no! There has been an error with the request!
          window.location='../auth/logout/';
        }
      }
  };
  xhr.send(secret);
});
rwForm.addEventListener('input', ()=> {
  const obj = document.getElementById('secretUpdate');
  obj.disabled = false;
  assing_id = parseInt (document.getElementById('head-id').innerHTML);
  obj.value = "SAVE CHANGES";
});