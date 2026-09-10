/*
 * perfil.js
 * Muestra los datos del usuario con sesión iniciada.
 *
 * No duplica datos: localStorage.sesionActual solo guarda el correo y
 * el tipo de cuenta (ver login.js). Esta página busca el registro
 * completo en "clientes" o "empleados" a partir de ese correo, así los
 * datos mostrados siempre están al día con lo último guardado.
 */

const ETIQUETAS_REGION_COMUNA = {
  particular: "Particular",
  contratista: "Contratista"
};

document.addEventListener("DOMContentLoaded", async () => {
  const vistaSinSesion = document.getElementById("perfil-sin-sesion");
  const vistaConSesion = document.getElementById("perfil-con-sesion");
  const botonCerrarSesion = document.getElementById("boton-cerrar-sesion");

  const sesion = JSON.parse(localStorage.getItem("sesionActual") || "null");

  if (!sesion) {
    mostrarSinSesion();
    return;
  }

  const registro = await buscarRegistro(sesion);

  if (!registro) {
    // La sesión apunta a un correo que ya no existe en los datos guardados
    // (por ejemplo, si se limpió localStorage a mano). Se trata como
    // "sin sesión" para no mostrar una pantalla a medio llenar.
    localStorage.removeItem("sesionActual");
    mostrarSinSesion();
    return;
  }

  mostrarPerfil(sesion, registro);

  async function buscarRegistro(sesion) {
    const lista = sesion.tipo === "empleado" ? await obtenerEmpleados() : await obtenerClientes();
    return lista.find((r) => r.correo.toLowerCase() === sesion.correo.toLowerCase()) || null;
  }

  function mostrarSinSesion() {
    vistaSinSesion.hidden = false;
    vistaConSesion.hidden = true;
  }

  function formatearFecha(iso) {
    if (!iso) return "No indicada";
    const fecha = new Date(iso);
    if (isNaN(fecha)) return "No indicada";
    return fecha.toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" });
  }

  function crearDato(etiqueta, valor) {
    const dt = document.createElement("dt");
    dt.className = "perfil-etiqueta";
    dt.textContent = etiqueta;

    const dd = document.createElement("dd");
    dd.className = "perfil-valor";
    dd.textContent = valor || "No indicado";

    return [dt, dd];
  }

  function mostrarPerfil(sesion, registro) {
    vistaSinSesion.hidden = true;
    vistaConSesion.hidden = false;

    document.getElementById("perfil-nombre").textContent = `${registro.nombre} ${registro.apellidos}`;
    document.getElementById("perfil-rol").textContent = sesion.rol;

    const listaDatos = document.getElementById("perfil-lista-datos");
    listaDatos.innerHTML = "";

    if (sesion.tipo === "empleado") {
      listaDatos.append(
        ...crearDato("Correo electrónico", registro.correo),
        ...crearDato("Rol en el sistema", registro.rol)
      );
    } else {
      listaDatos.append(
        ...crearDato("RUN", registro.run),
        ...crearDato("Correo electrónico", registro.correo),
        ...crearDato("Tipo de cliente", ETIQUETAS_REGION_COMUNA[registro.tipoCliente] || registro.tipoCliente),
        ...crearDato("Fecha de nacimiento", registro.fechaNacimiento ? formatearFecha(registro.fechaNacimiento) : "No indicada"),
        ...crearDato("Región", registro.region),
        ...crearDato("Comuna", registro.comuna),
        ...crearDato("Dirección", registro.direccion),
        ...crearDato("Cliente desde", formatearFecha(registro.fechaRegistro))
      );
    }
  }

  botonCerrarSesion?.addEventListener("click", () => {
    localStorage.removeItem("sesionActual");
    window.location.href = "index.html";
  });
});