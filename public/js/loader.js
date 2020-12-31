export function stopSpinner() {
    const loader = document.getElementById('loader');
    loader.style.visibility = "hidden";
}
export function startSpinner() {
    const loader = document.getElementById('loader');
    loader.style.visibility = "visible";
}