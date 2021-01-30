import { addSecret, deleteSecret, getSecret, getAllSecret, updateSecret, shareSecret, unshareSecret} from '../API/server.js';

//share secret
let shareSecretForm = document.getElementById('share-secret');
shareSecretForm.addEventListener('submit', async(event)=> {
	event.preventDefault();
	let username = document.getElementById('friend-username').value,
	e = document.getElementById('friend-rights'),
	rights = e.options[e.selectedIndex].value,
	msg = document.getElementById('shareSecretHelp'),
	recordId = document.getElementById('record-id').getAttribute('data-content');
	
	try {
		const res = await shareSecret(recordId, username, rights);
		// add the user here...
		msg.style.display = "none";
	} catch (error) {
		console.log(error);
		msg.innerHTML = error.response.message;
		msg.style.display = "block";
	}
});
// add secret
let insertForm = document.getElementById('add-secret');
insertForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	let e = insertForm.elements;
	let secret = {
		title: e[0].value,
		login: e[1].value,
		password: e[2].value,
		websiteAddress: e[3].value,
		note: e[4].value,
	};
	let username = document.getElementById('username').innerText;
	username = username.substr(10);
	try {
		let res = await addSecret(secret, username);
		if (res.response.ok) {
			document.getElementsByClassName('close')[0].click();
			insertForm.reset();
			viewVault();
		}
	} catch (error) {
		// ohh no! something went wrong....
		console.log(error);
	}
});
// delete secret
window.deleteSecret = async function (id) {
	if (!confirm('Are you sure you want to delete the secret permanently, Continue ?')) return;
	try {
		let res = await deleteSecret(id);
		if (res.response.ok)	viewVault();
	} catch (error) {
		// ohh no! something went wrong....
		console.log(error);
	}
}
// show decrypted secret
window.decryptSecret = async function (id) {
	document.getElementById('record-id').setAttribute("data-content", id);
	let status = !document.getElementById('decryption').checked;
	try {
		let secret = await getSecret(id, status);
		var e = rwForm.elements;
		e[0].value = secret.login;
		e[1].value = secret.password;
		e[2].value = secret.websiteAddress;
		e[3].value = secret.note;
		document.getElementById('record-title').innerHTML = `<span class="material-icons" style="vertical-align: middle; opacity: 0.5">text_snippet</span>`+secret.title;
		$('#update-secret-modal').modal('show');
	} catch (error) {
		console.log(error);
	}
}
// update only modified fields...
let rwForm = document.getElementById('update-secret');
rwForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	let e = rwForm.elements;
	let secret = {
		login: e[0].value,
		password: e[1].value,
		websiteAddress: e[2].value,
		note: e[3].value,
	};
	let username = document.getElementById('username').innerText;
	username = username.substr(10);
	try {
		let res = await updateSecret(secret, username);
		if (res.response.ok) {
			document.getElementsByClassName('close')[0].click();
			rwForm.reset();
			viewVault();
		}
	} catch (error) {
		// ohh no! something went wrong....
		console.log(error);
	}
});
rwForm.addEventListener('input', () => {
	const obj = document.getElementById('secretUpdate');
	obj.disabled = false;
});
// view complete vault
window.viewVault = async function () {
	try {
		let res = await getAllSecret();
		let secrets = res.response.secrets, all = "";
		secrets.forEach((secret) => {
			all += `<tr class="table-row">
                <td onclick="decryptSecret(this.id)" id="${secret.id}"  style="cursor: pointer;"> 
                <span class="material-icons" style="vertical-align: bottom;">text_snippet</span>
				${secret.title}</td>
				<td>${secret.lastModifiedAt.slice(0, -22)}-${res.response.username}</td>
				
                <td>Who has access</td>
                <td  style="cursor: pointer;">
                  <div class="btn-group">
                    <span class="material-icons" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      more_vert
                    </span>
                    <div class="dropdown-menu">
                      <li><a class="dropdown-item" name="${secret.id}" onclick="decryptSecret(this.name)">Show</a></li>
                      <li><a class="dropdown-item" onclick="deleteSecret(this.name);" data-toggle="modal" data-target="#confirm-delet" name=${secret.id}>Delete</a></li>
                    </div>
                  </div>
                </td>
              </tr>`;
		});
		const tbody = document.getElementById('all-secrets');
		tbody.innerHTML = all;
	} catch (error) {
		// ohh no! something went wrong....
		console.log(error)
	}
}
viewVault();