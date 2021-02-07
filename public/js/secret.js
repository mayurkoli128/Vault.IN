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
import {show} from '../partials/messages.js';

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
	secretId = document.getElementById('record-id').getAttribute('data-content');

	try {
		const res = await shareSecret(secretId, username, rights);
		// add the user here...
		show(res.response.message, "success", "show-secret-share-details-msg");
		whoHasAccess(secretId);
	} catch (error) {
		console.log(error);
		show(error.response.message, "danger", "show-secret-share-details-msg");
	}
};
window.unshareSecret = async function(friendName) {
	let secretId = document.getElementById('record-id').getAttribute('data-content');
	try {
		const res = await unshareSecret(secretId, friendName);
		whoHasAccess(secretId);
		viewVault();
		show(res.response.message, "success", "show-secret-share-details-msg");
	} catch (error) {
		console.log(error);
		show(error.response.message, "danger", "show-secret-share-details-msg");
	}
}
// change user rights
window.changeRights = async function(friendName) {
	let secretId = document.getElementById('record-id').getAttribute('data-content'),
	e = document.getElementsByName(friendName)[0],
	rights = e.options[e.selectedIndex].value;
	e.disabled=true;
	try {
		//change user rights...
		const res = await changeRights(rights, friendName, secretId);
		show(res.response.message, "success", "show-secret-share-details-msg");
	} catch (error) {
		console.log(error);
		show(error.response.message, "danger", "show-secret-share-details-msg");
	}
	e.disabled=false;
}
window.whoHasAccess = async function (id) {
	let e = document.getElementById('whoHasAccess'), list = "";
	try {
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
			<td scope="row"><span class="profile-logo" style="background-color: ${owner.avatar}"> ${logo}</span>${owner.username}</td>
			<td>
				<select name="${owner.username}" onchange="changeRights(this.name);" ${disabled}>
				${options}
				</select>
			</td>
			<td>
				<abbr title="unshare secret" style="text-decoration: none; border: none;"> 
				<button name="${owner.username}" onclick="unshareSecret(this.name)" 
					class="material-icons btn btn-light" style="vertical-align: middle; cursor: pointer; user-select: none;" ${disabled}>
					remove_circle_outline
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
				<button onclick="shareSecret()"
				class="material-icons btn btn-light" style="vertical-align: middle; cursor: pointer; user-select: none;">
				add_circle_outline
				</button>
			</abbr>
			</td>
		</tr>`;

	e.innerHTML = list;
	viewVault();
	} catch (error) {
		show("Something failed", "danger", "system-msg");
		console.log(error);
	}
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
		show(res.response.message, "success", "add-secret-msg");
		document.getElementsByClassName('close')[0].click();
		insertForm.reset();
		viewVault();
	} catch (error) {
		// ohh no! something went wrong....
		show(error.response.message, "danger", "system-msg");
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
		show(error.response.message, "danger", "system-msg");
		console.log(error);
	}
}
// show decrypted secret
window.decryptSecret = async function (id) {
	document.getElementById('record-id').setAttribute("data-content", id);
	let status = !document.getElementById('decryption').checked;
	try {
		let {secret, title, rights} = await getSecret(id, status);
		if (status)	rights = 0;
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
		show("Something failed!", "danger", "system-msg");
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
		show(error.response.message, "danger", "system-msg");
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
		let {secrets, user} = await getAllSecret();
		let all = "";
		for (let i = 0; i < secrets.length; i++) {
			const {owners} = await getOwners(secrets[i].id);
			// create logo for first three users....
			let ownersLogo="", others="", names=[];
			for (let i = 0; i < owners.length; i++) {
				// create logo...
				let logo = owners[i].username[0]+owners[i].username[1];
				logo = logo.toUpperCase();
				if (i > 2) {
					names.push(owners[i].username);
				} else {
					ownersLogo += `<abbr title="${owners[i].username}" style="cursor: text ;text-decoration: none; border: none;"> <span class="profile-logo" style="font-size: 10px ;background-color: ${owners[i].avatar}"> ${logo} </span></abbr>`;
				}
			}
			if (names.length)
				others = `<abbr title="${names.join(', ')}" style="cursor: text ;text-decoration: none; border: none;"><span class="profile-logo" style="font-size: 10px ;background-color: grey"> +${names.length} </span></abbr>`;

			secrets[i].lastModifiedAt = timeSince(new Date(secrets[i].lastModifiedAt));
			all += `<tr class="table-row">
                <td onclick="decryptSecret(this.id)" id="${secrets[i].id}"  style="cursor: pointer;"> 
                <span class="material-icons" style="vertical-align: bottom;">text_snippet</span>
				${secrets[i].title}</td>
				<td>${secrets[i].lastModifiedAt} - ${user}</td>
				
				<td scope="row">
					${ownersLogo + others}
				</td>

                <td  style="cursor: pointer;">
                  <div class="btn-group">
                    <span class="material-icons" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      more_vert
                    </span>
                    <div class="dropdown-menu">
                      <li><a class="dropdown-item" name="${secrets[i].id}" onclick="decryptSecret(this.name)">Show</a></li>
                      <li><a class="dropdown-item" onclick="deleteSecret(this.name);" data-toggle="modal" data-target="#confirm-delet" name=${secrets[i].id}>Delete</a></li>
                    </div>
                  </div>
                </td>
              </tr>`;
		}
		const tbody = document.getElementById('all-secrets');
		tbody.innerHTML = all;
	} catch (error) {
		// ohh no! something went wrong....
		show(error, "danger", "system-msg");
		console.log(error);
	}
}
viewVault();

function timeSince(date) {
	let val; 
	
	let seconds = Math.floor((new Date() - date) / 1000);
  
	let interval = seconds / 31536000;
  
	if (interval > 1) {
	  val = Math.floor(interval);
	  if (val == 1)	return "a year ago";
	  else return val + " years ago";
	}
	interval = seconds / 2592000;
	if (interval > 1) {
	  val = Math.floor(interval);
	  if (val == 1)	return "a month ago";
	  else return val + " months ago";
	}
	interval = seconds / 86400;
	if (interval > 1) {
	  val = Math.floor(interval);
	  if (val == 1)	return "a day ago";
	  else return val + " days ago";
	}
	interval = seconds / 3600;
	if (interval > 1) {
	  val = Math.floor(interval);
	  if (val == 1)	return "an hour ago";
	  else return val + " hours ago";
	}
	interval = seconds / 60;
	if (interval > 1) {
	  val = Math.floor(interval);
	  if (val == 1)	return "a minute ago";
	  else return val + " minutes ago";
	}
	return "a few seconds ago";
  }