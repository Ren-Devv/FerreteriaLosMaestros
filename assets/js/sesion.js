/*
 * sesion.js
 * Se carga en TODAS las páginas (después de menu.js). Ajusta las
 * acciones del header según si hay una sesión activa en localStorage:
 *   - Sin sesión: se ven "Iniciar sesión", "Crear cuenta" y
 *     "Cuenta corriente" normalmente.
 *   - Con sesión: se ocultan esos tres, "Mi cuenta" pasa a decir
 *     "Hola, <nombre>" y aparece un botón "Cerrar sesión".
 *
 * No depende de usuarios.js: el nombre ya viaja dentro de
 * "sesionActual" desde que login.js autentica, así esta página no
 * necesita volver a consultar assets/data/usuarios.json.
 */

document.addEventListener("DOMContentLoaded", () => {
  const sesion = JSON.parse(localStorage.getItem("sesionActual") || "null");

  const enlaceMiCuenta = document.getElementById("enlace-mi-cuenta");
  const enlaceIniciarSesion = document.getElementById("enlace-iniciar-sesion");
  const enlaceCrearCuenta = document.getElementById("enlace-crear-cuenta");
  const enlaceCuentaCorriente = document.getElementById("enlace-cuenta-corriente");
  const botonCerrarSesion = document.getElementById("boton-cerrar-sesion-header");

  if (!sesion) return; // Estado por defecto del HTML ya es "sin sesión"

  if (enlaceIniciarSesion) enlaceIniciarSesion.hidden = true;
  if (enlaceCrearCuenta) enlaceCrearCuenta.hidden = true;
  if (enlaceCuentaCorriente) enlaceCuentaCorriente.hidden = true;

  if (enlaceMiCuenta) {
    const primerNombre = sesion.nombre ? sesion.nombre.split(" ")[0] : "Mi cuenta";
    enlaceMiCuenta.textContent = `Hola, ${primerNombre}`;
  }

  if (botonCerrarSesion) {
    botonCerrarSesion.hidden = false;
    botonCerrarSesion.addEventListener("click", () => {
      localStorage.removeItem("sesionActual");
      window.location.href = "index.html";
    });
  }
});