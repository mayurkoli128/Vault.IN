export function show(message, type, id) {
  let e = document.getElementById(id);
  e.setAttribute("class", `alert alert-${type}`);
  e.innerText = message;
  e.style.display = "block";
  setTimeout(() => {
    e.style.display = "none";
  }, 4*1000);
}
