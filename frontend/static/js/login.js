const campoClave = document.getElementById("clave");
const botonMostrar = document.getElementById("mostrarClave");

botonMostrar.addEventListener("click", function () {
    if (campoClave.type === "password") {
        campoClave.type = "text";
        botonMostrar.textContent = "Ocultar";
    } else {
        campoClave.type = "password";
        botonMostrar.textContent = "Ver";
    }
});