const campoClave = document.getElementById("clave");
const botonMostrar = document.getElementById("mostrarClave");
const mensajeError = document.getElementById("error-login");

if (mensajeError && mensajeError.textContent.includes("{{")) {
    mensajeError.remove();
}

botonMostrar.addEventListener("click", function () {
    if (campoClave.type === "password") {
        campoClave.type = "text";
        botonMostrar.textContent = "Ocultar";
    } else {
        campoClave.type = "password";
        botonMostrar.textContent = "Ver";
    }
});