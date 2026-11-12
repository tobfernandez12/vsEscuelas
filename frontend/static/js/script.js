const botonMenu = document.querySelector(".menu-alternar");
const navegacion = document.querySelector("#navegacion-principal");

document.querySelectorAll("a[data-static-href]").forEach((enlace) => {
    const destino = enlace.getAttribute("href");
    if (destino && destino.includes("{{")) {
        enlace.setAttribute("href", enlace.dataset.staticHref);
    }
});

if (botonMenu && navegacion) {
    const cerrarMenu = () => {
        botonMenu.setAttribute("aria-expanded", "false");
        navegacion.classList.remove("abierto");
    };

    botonMenu.addEventListener("click", () => {
        const abierto = botonMenu.getAttribute("aria-expanded") === "true";
        botonMenu.setAttribute("aria-expanded", String(!abierto));
        navegacion.classList.toggle("abierto", !abierto);
    });

    navegacion.addEventListener("click", (evento) => {
        if (evento.target.closest("a")) {
            cerrarMenu();
        }
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            cerrarMenu();
        }
    });
}