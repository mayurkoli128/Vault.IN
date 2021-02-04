import { 
	addSecret, 
	deleteSecret, 
	getSecret, 
	getAllSecret, 
	updateSecret, 
	shareSecret, 
	unshareSecret, 
	getOwners,
	changeRights,
} from '../API/server.js';

const rights = {
	0: "Read",
	1: "Read & Write",
	2: "Read, Write & Share"
}
//share secret
window.shareSecret = async function() {
	let username = document.getElementById('friend-username').value,
	e = document.getElementById('friend-rights'),
	rights = e.options[e.selectedIndex].value,
	msg = document.getElementById('shareSecretHelp'),
	secretId = document.getElementById('record-id').getAttribute('data-content');

	try {
		const res = await shareSecret(secretId, username, rights);
		// add the user here...
		whoHasAccess(secretId);
	} catch (error) {
		console.log(error);
		msg.innerHTML = error.response.message;
		msg.style.display = "block";
		setTimeout(() => {
			msg.style.display="none";
		}, 4*1000);
	}
};
window.changeRights = async function(username) {
	let msg = document.getElementById('shareSecretHelp'),
	secretId = document.getElementById('record-id').getAttribute('data-content'),
	e = document.getElementById(username),
	rights = e.options[e.selectedIndex].value;
	e.disabled=true;
	try {
		//change user rights...
		await changeRights(rights, username, secretId);
		setTimeout(() => {
			e.disabled=false;
		}, 1*1000);
	} catch (error) {
		console.log(error);
		msg.innerHTML = error.response.message;
		msg.style.display = "block";
		e.disabled=false;
		setTimeout(() => {
			msg.style.display="none";
		}, 4*1000);
	}

}
window.whoHasAccess = async function (id) {
	let e = document.getElementById('whoHasAccess'), list = "";
	const {user, owners} = await getOwners(id);
	owners.forEach((owner)=> {
		// create logo...
		let logo = owner.username[0]+owner.username[1], options="", disabled="";
		logo = logo.toUpperCase();

		// create options...
		for (let i = 0; i < 3; i++) {
			if (owner.rights == i) 
				options += `<option value="${i}" selected>${rights[i]}</option>`;
			else options += `<option value="${i}">${rights[i]}</option>`;
		}
		if (user.username == owner.username || user.rights < 2) {
			disabled="disabled";
		}
		// create list
		list += `<tr>
			<td scope="row"><span class="profile-logo">${logo}</span>${owner.username}</td>
			<td>
				<select id="${owner.username}" onchange="changeRights(this.id)" ${disabled}>
				${options}
				</select>
			</td>
			<td>
				<abbr title="unshare secret" style="text-decoration: none; border: none;"> 
				<button type="submit" style="padding: 0; border: none; background: none;">
				<span
					class="material-icons btn btn-light" style="vertical-align: middle; cursor: pointer; user-select: none;" ${disabled}>
					remove_circle_outline
				</span>
				</button>
				</abbr>
			</td>
		</tr>`
	});
	list += `<tr>
			<td scope="row"><input type="text" name="friend-username" id="friend-username"
				placeholder="Username..." autocomplete="off"></td>
			<td>
			<select name="friend-rights" id="friend-rights">
				<option value="0">Read</option>
				<option value="1">Read & Write</option>
				<option value="2">Read, Write & Share</option>
			</select>
			</td>
			<td>
			<abbr title="share secret" style="text-decoration: none; border: none;"> 
				<button type="submit" style="padding: 0; border: none; background: none;" onclick="shareSecret()"> 
					<span
					class="material-icons btn btn-light" style="vertical-align: middle; cursor: pointer; user-select: none;">
					add_circle_outline
					</span>
				</button>
			</abbr>
			</td>
		</tr>`;

	e.innerHTML = list;
}

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
		let {secret, title, rights} = await getSecret(id, status);
		var e = rwForm.elements;
		e[0].value = secret.login;
		e[0].disabled= (rights == 0);
		e[1].value = secret.password;
		e[1].disabled= (rights == 0);
		e[2].value = secret.websiteAddress;
		e[2].disabled= (rights == 0);
		e[3].value = secret.note;
		e[3].disabled= (rights == 0);
		document.getElementById('record-title').innerHTML = `<span class="material-icons" style="vertical-align: middle; opacity: 0.5">text_snippet</span>`+title;
		whoHasAccess(id);
		$('#update-secret-modal').modal('show');
	} catch (error) {
		console.log(error);
	}
}
// update only modified fields...
let rwForm = document.getElementById('update-secret');
rwForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	let e = rwForm.elements,
	secretId = document.getElementById('record-id').getAttribute('data-content');;
	let secret = {
		login: e[0].value,
		password: e[1].value,
		websiteAddress: e[2].value,
		note: e[3].value,
	};
	let username = document.getElementById('username').innerText;
	username = username.substr(10);
	try {
		let res = await updateSecret(secret, secretId, username);
		if (res.response.ok) {
			document.getElementsByClassName('close')[1].click();
			rwForm.reset();
			document.getElementById('secretUpdate').disabled=true;
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