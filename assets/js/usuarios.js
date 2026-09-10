/*
 * usuarios.js
 * Fuente de datos de usuarios del sitio (mismo patrón que
 * productos.js/categorias.json para el catálogo).
 *
 * assets/data/usuarios.json es la SEMILLA: la primera vez que alguien
 * visita el sitio, este archivo se copia a localStorage (claves
 * "clientes" y "empleados"). De ahí en adelante localStorage manda:
 * como no hay backend, los nuevos registros (registro.html) y cualquier
 * cambio se guardan solo en localStorage, nunca de vuelta en el .json.
 *
 * Páginas que necesiten leer o guardar usuarios deben cargar este
 * script ANTES de su propio script (igual que productos.js antes de
 * catalogo.js) y usar las funciones de abajo en vez de tocar
 * localStorage directamente.
 */

const RUTA_USUARIOS_JSON = "assets/data/usuarios.json";

let promesaInicializacion = null;

function inicializarUsuarios() {
  if (!promesaInicializacion) {
    promesaInicializacion = (async () => {
      const yaHayClientes = localStorage.getItem("clientes");
      const yaHayEmpleados = localStorage.getItem("empleados");

      if (yaHayClientes && yaHayEmpleados) return;

      const respuesta = await fetch(RUTA_USUARIOS_JSON);
      const semilla = await respuesta.json();

      if (!yaHayClientes) {
        localStorage.setItem("clientes", JSON.stringify(semilla.clientes || []));
      }
      if (!yaHayEmpleados) {
        localStorage.setItem("empleados", JSON.stringify(semilla.empleados || []));
      }
    })();
  }
  return promesaInicializacion;
}

async function obtenerClientes() {
  await inicializarUsuarios();
  return JSON.parse(localStorage.getItem("clientes") || "[]");
}

async function obtenerEmpleados() {
  await inicializarUsuarios();
  return JSON.parse(localStorage.getItem("empleados") || "[]");
}

function guardarClientes(clientes) {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

function guardarEmpleados(empleados) {
  localStorage.setItem("empleados", JSON.stringify(empleados));
}

async function agregarCliente(nuevoCliente) {
  const clientes = await obtenerClientes();
  clientes.push(nuevoCliente);
  guardarClientes(clientes);
  return clientes;
}