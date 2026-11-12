const CLAVE_REPORTES = "reportes";
const ESTADOS_VALIDOS = ["Abierto", "En proceso", "Cerrado"];
const PRIORIDADES_VALIDAS = ["Baja", "Media", "Alta"];

const formularioCrear = document.getElementById("crear-reporte");
const formularioFiltro = document.getElementById("filtro-reportes");
const formularioEditar = document.getElementById("editar-reporte");
const listaReportes = document.getElementById("lista-reportes");
const campoTitulo = document.getElementById("detalle-titulo");
const campoDescripcion = document.getElementById("detalle-descripcion");
const campoEstado = document.getElementById("detalle-estado");
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
    campoTitulo.textContent = reporte ? reporte.titulo : "Seleccioná un reporte";
    campoDescripcion.textContent = reporte ? reporte.descripcion : "-";
    campoEstado.textContent = reporte ? reporte.estado : "-";
    formularioEditar.elements.descripcion.value = reporte ? reporte.descripcion : "";
    formularioEditar.elements.prioridad.value = reporte ? reporte.prioridad : "Baja";
    formularioEditar.elements.descripcion.disabled = !reporte;
    formularioEditar.elements.prioridad.disabled = !reporte;
    formularioEditar.querySelector("button[type='submit']").disabled = !reporte;
}

function renderizarReportes() {
    const busqueda = formularioFiltro.elements.busqueda.value.trim().toLocaleLowerCase();
    const estado = formularioFiltro.elements.estado.value;
    const prioridad = formularioFiltro.elements.prioridad.value;
    const filtrados = reportes.filter((reporte) => {
        const coincideTexto = `${reporte.titulo} ${reporte.descripcion}`
            .toLocaleLowerCase()
            .includes(busqueda);
        return coincideTexto && (!estado || reporte.estado === estado) &&
            (!prioridad || reporte.prioridad === prioridad);
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

    const descripcionAnterior = reporte.descripcion;
    const prioridadAnterior = reporte.prioridad;
    reporte.descripcion = formularioEditar.elements.descripcion.value.trim();
    reporte.prioridad = formularioEditar.elements.prioridad.value;
    if (!guardarReportes()) {
        reporte.descripcion = descripcionAnterior;
        reporte.prioridad = prioridadAnterior;
        return;
    }
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