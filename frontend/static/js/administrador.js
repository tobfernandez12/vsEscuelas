const CLAVE_REPORTES = "reportes";
const ESTADOS_VALIDOS = ["Abierto", "En proceso", "Cerrado"];
const PRIORIDADES_VALIDAS = ["Baja", "Media", "Alta"];

const formularioCrear = document.getElementById("crear-reporte");
const formularioFiltro = document.getElementById("filtro-reportes");
const formularioEditar = document.getElementById("editar-reporte");
const formularioEliminar = document.getElementById("eliminar-reporte");
const listaReportes = document.getElementById("lista-reportes");
const camposDetalle = {
    titulo: document.getElementById("detalle-titulo"),
    descripcion: document.getElementById("detalle-descripcion"),
    prioridad: document.getElementById("detalle-prioridad"),
    estado: document.getElementById("detalle-estado")
};
let reportes;
let reporteSeleccionadoId = null;

function leerReportes() {
    const guardados = localStorage.getItem(CLAVE_REPORTES);
    if (guardados === null) {
        return [];
    }

    const datos = JSON.parse(guardados);
    if (!Array.isArray(datos)) {
        throw new Error("Los reportes guardados tienen un formato inválido.");
    }
    return datos;
}

function guardarReportes() {
    try {
        localStorage.setItem(CLAVE_REPORTES, JSON.stringify(reportes));
        return true;
    } catch (error) {
        alert("No se pudieron guardar los reportes en este navegador.");
        return false;
    }
}

function buscarReporteSeleccionado() {
    return reportes.find((reporte) => reporte.id === reporteSeleccionadoId);
}

function desactivarInterfaz() {
    document.querySelectorAll("form button, form input, form select, form textarea")
        .forEach((control) => {
            control.disabled = true;
        });
}

function mostrarDetalle(reporte) {
    camposDetalle.titulo.textContent = reporte ? reporte.titulo : "Seleccioná un reporte";
    camposDetalle.descripcion.textContent = reporte ? reporte.descripcion : "-";
    camposDetalle.prioridad.textContent = reporte ? reporte.prioridad : "-";
    camposDetalle.estado.textContent = reporte ? reporte.estado : "-";

    formularioEditar.elements.estado.value = reporte ? reporte.estado : "Abierto";
    formularioEditar.elements.solucion.value = reporte ? (reporte.solucion || "") : "";
    formularioEditar.querySelector("button[type='submit']").disabled = !reporte;
    formularioEliminar.querySelector("button[type='submit']").disabled =
        !reporte || reporte.estado !== "Abierto";
}

function renderizarReportes() {
    const busqueda = formularioFiltro.elements.busqueda.value.trim().toLocaleLowerCase();
    const estado = formularioFiltro.elements.estado.value;
    const filtrados = reportes.filter((reporte) => {
        const coincideTexto = `${reporte.titulo} ${reporte.descripcion}`
            .toLocaleLowerCase()
            .includes(busqueda);
        return coincideTexto && (!estado || reporte.estado === estado);
    });

    listaReportes.replaceChildren();
    if (filtrados.length === 0) {
        const vacio = document.createElement("li");
        vacio.textContent = "No hay reportes para mostrar.";
        listaReportes.appendChild(vacio);
    } else {
        filtrados.forEach((reporte) => {
            const elemento = document.createElement("li");
            const enlace = document.createElement("a");
            enlace.href = "#detalle";
            enlace.dataset.reporteId = reporte.id;
            enlace.textContent = reporte.titulo;
            elemento.append(enlace, ` - ${reporte.estado} - ${reporte.prioridad}`);
            listaReportes.appendChild(elemento);
        });
    }

    if (!filtrados.some((reporte) => reporte.id === reporteSeleccionadoId)) {
        reporteSeleccionadoId = filtrados.length ? filtrados[0].id : null;
    }
    mostrarDetalle(buscarReporteSeleccionado() || null);
}

formularioCrear.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formularioCrear);
    const nuevoReporte = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        titulo: datos.get("titulo").trim(),
        descripcion: datos.get("descripcion").trim(),
        prioridad: datos.get("prioridad"),
        estado: "Abierto",
        solucion: ""
    };

    reportes.unshift(nuevoReporte);
    if (!guardarReportes()) {
        reportes.shift();
        return;
    }

    formularioCrear.reset();
    reporteSeleccionadoId = nuevoReporte.id;
    renderizarReportes();
});

formularioFiltro.addEventListener("submit", (evento) => {
    evento.preventDefault();
    renderizarReportes();
});

listaReportes.addEventListener("click", (evento) => {
    const enlace = evento.target.closest("a[data-reporte-id]");
    if (!enlace || !listaReportes.contains(enlace)) {
        return;
    }
    evento.preventDefault();
    reporteSeleccionadoId = enlace.dataset.reporteId;
    renderizarReportes();
});

formularioEditar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const reporte = buscarReporteSeleccionado();
    if (!reporte) {
        return;
    }

    const estadoAnterior = reporte.estado;
    const solucionAnterior = reporte.solucion;
    reporte.estado = formularioEditar.elements.estado.value;
    reporte.solucion = formularioEditar.elements.solucion.value.trim();
    if (!guardarReportes()) {
        reporte.estado = estadoAnterior;
        reporte.solucion = solucionAnterior;
        return;
    }
    renderizarReportes();
});

formularioEliminar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const reporte = buscarReporteSeleccionado();
    if (!reporte || reporte.estado !== "Abierto") {
        return;
    }
    if (!confirm("¿Seguro que querés eliminar este reporte?")) {
        return;
    }

    const indice = reportes.findIndex((elemento) => elemento.id === reporte.id);
    reportes.splice(indice, 1);
    if (!guardarReportes()) {
        reportes.splice(indice, 0, reporte);
        return;
    }
    reporteSeleccionadoId = null;
    renderizarReportes();
});

try {
    reportes = leerReportes();
    if (reportes.some((reporte) => !reporte || typeof reporte.id !== "string" ||
        typeof reporte.titulo !== "string" || typeof reporte.descripcion !== "string" ||
        !ESTADOS_VALIDOS.includes(reporte.estado) ||
        !PRIORIDADES_VALIDAS.includes(reporte.prioridad))) {
        throw new Error("Los reportes guardados tienen un formato inválido.");
    }
    renderizarReportes();
} catch (error) {
    desactivarInterfaz();
    alert(error.message || "No se pudieron cargar los reportes guardados.");
}