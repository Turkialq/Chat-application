
const container = document.querySelector(".container");
const pwShowHide = document.querySelector(".showHidePw");
const pwFields = document.querySelector(".password");
const cnpwField = document.querySelector(".confirmPassword");
const loader = document.querySelector(".loader");


// Loader Animation`
window.addEventListener("load", () => {
    loader.classList.add("disppear");

});
// Show Password on/off
pwShowHide.addEventListener('click', () => {
    if(pwFields.getAttribute("type") === "password") {
        pwFields.setAttribute("type","text");
        cnpwField.setAttribute("type", "text");
        pwShowHide.classList.replace("uil-eye-slash", "uil-eye");
    }else {
        pwFields.setAttribute("type", "password");
        cnpwField.setAttribute("type", "password");
        pwShowHide.classList.replace("uil-eye", "uil-eye-slash");
    }
});





