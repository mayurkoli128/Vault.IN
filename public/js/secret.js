import {encrypt, decrypt} from './index.js';
import {stopSpinner, startSpinner} from './loader.js';
import {makeRequest} from './xhr.js';

// add secret
let insertForm = document.getElementById('add-secret');
insertForm.addEventListener('submit', async(event)=> {
  event.preventDefault();
  let secret={}, title;
  for ( var i = 0; i < insertForm.elements.length; i++) {
      var e = insertForm.elements[i];
      if (e.type === 'submit') continue ;
      if (e.name === 'title')   title = e.value ;
      else 
        secret[e.name] = e.value;
  }
  secret = await encrypt(secret);
  secret['title'] = title ;
  try {
    let res = await makeRequest({method: "POST", url: "../secrets/add", headers: {"Content-Type": "application/json;charset=UTF-8"}, data: secret});
    res = JSON.parse(res);
    if (res.ok) {
      document.getElementsByClassName('close')[0].click();
      insertForm.reset();
      viewVault();
    }
  } catch (error) {
    // ohh no! something went wrong....
    console.log("Error "+err);
  }
});
// delete secret
window.deleteSecret = async function(id) {
  if (!confirm('Are you sure you want to delete the secret permanently, Continue ?')) return ;
  startSpinner();
  try {
    let res = await makeRequest({method: "DELETE", url: `../secrets/${id}`});
    if (res)  stopSpinner(), viewVault();
  } catch (error) {
    // ohh no! something went wrong....
    console.log("Error "+err);
  }
}
// show decrypted secret
let rwForm = document.getElementById('update-secret');
window.decryptSecret = async function(id) {
  startSpinner();
  document.getElementById('head-id').innerHTML=id;
  try {
    let res = await makeRequest({method: "GET", url: `../secrets/${id}`});
    let secret = JSON.parse(res).secret;
    let title = secret['title'];
    delete secret.title;
    let flag = document.getElementById('decryption').checked;
    if (flag) {
      secret = await decrypt(secret);
    }
    for ( var i = 0; i < rwForm.elements.length; i++) {
      var e = rwForm.elements[i];
      if (e.name === '') continue ;
      if (!flag) e.disabled = true;
      else e.disabled = false;
      if (e.type === 'button') continue ;
      if (e.name === 'title') e.value = title;
      else 
        e.value = secret[e.name];
    }
    stopSpinner();
    $('#update-secret-modal').modal('show');
  } catch (error) {
    // ohh no! something went wrong....
    console.log("Error :"+error)
  }
}
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
  try {
    let res = await makeRequest({method: "PATCH", url: `../secrets/${assing_id}`, headers: {"Content-Type": "application/json;charset=UTF-8"}, data: secret});
    document.getElementsByClassName('close')[1].click();
    viewVault();
    const obj = document.getElementById('secretUpdate');
    obj.disabled = true;
  } catch (error) {
    // ohh no! something went wrong....
    console.log("Error "+error);
  }
});
rwForm.addEventListener('input', ()=> {
  const obj = document.getElementById('secretUpdate');
  obj.disabled = false;
  assing_id = parseInt (document.getElementById('head-id').innerHTML);
  obj.value = "SAVE CHANGES";
});
// view complete vault
window.viewVault = async function() {
  startSpinner();
  try {
    let res = await makeRequest({method: "GET", url: "../secrets/"});
    res = JSON.parse(res);
    let secrets = res.secrets, all="";
    secrets.forEach((secret)=> {
      all += `<tr class="table-row">
                <th scope="row" >${secret.id}</th>
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
  } catch (error) {
    // ohh no! something went wrong....
    console.log("Error :"+error)
  }
}
viewVault();
