import {addUser} from "../API/server.js";
const form = document.getElementById('form');
let db = window.location.origin;

form.addEventListener('submit', async(event)=> {
    event.preventDefault();
    let btn = document.getElementById('register-btn');
    btn.disabled = true ;
    let e = form.elements;
    let user={
      username: e[0].value,
      password: e[1].value,
      confirmPassword: e[2].value,
      avatar: getRandomColor(),
    };
    try { 
      const res = await addUser(user);
      if (res.response.ok) {
        window.location.href = `${db}/vault`;
        btn.disabled = false;
      }
    } catch (error) {
      // ohh no! something went wrong....
      btn.disabled = false;
      let errBox = document.getElementById('error-messages');
      errBox.style.display="block";
      errBox.innerText = error.response.message;
    }
});

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}