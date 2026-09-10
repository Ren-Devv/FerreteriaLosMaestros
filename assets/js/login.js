/*
 * Formulario de Inicio de sesión.
 * Mismo patrón de validación que registro.js (submit+preventDefault,
 * mostrarError/limpiarError, blur/input).
 *
 * Autenticación simulada en el cliente (sin backend): busca el
 * correo+contraseña entre los clientes y empleados que expone
 * usuarios.js (semilla assets/data/usuarios.json + lo agregado en
 * localStorage por registro.html).
 *
 * Al autenticar con éxito guarda en localStorage, bajo la clave
 * "sesionActual", solo el identificador de quién inició sesión:
 *   { tipo: "cliente" | "empleado", correo, rol }
 * perfil.js usa ese correo para recuperar el registro completo desde
 * "clientes" o "empleados", así no hay datos duplicados ni desfasados.
 */

const CORREOS_PERMITIDOS = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-login");
  if (!form) return;

  const campoCorreo = document.getElementById("correo");
  const campoPassword = document.getElementById("password");

  function mostrarError(control, idError, mensaje) {
    const elementoError = document.getElementById(idError);
    if (elementoError) elementoError.textContent = mensaje;
    control.setAttribute("aria-invalid", "true");
    control.classList.add("campo-invalido");
  }

  function limpiarError(control, idError) {
    const elementoError = document.getElementById(idError);
    if (elementoError) elementoError.textContent = "";
    control.removeAttribute("aria-invalid");
    control.classList.remove("campo-invalido");
  }

  function validarCorreo(valor) {
    if (valor.length === 0 || valor.length > 100) return false;
    const partes = valor.split("@");
    if (partes.length !== 2) return false;
    const formatoBasico = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    if (!formatoBasico) return false;
    return CORREOS_PERMITIDOS.includes(partes[1].toLowerCase());
  }

  function validarPassword(valor) {
    return valor.length >= 4 && valor.length <= 10;
  }

  campoCorreo.addEventListener("blur", () => {
    const valor = campoCorreo.value.trim();
    if (!validarCorreo(valor)) {
      mostrarError(
        campoCorreo,
        "error-correo",
        "Correo inválido. Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com."
      );
    } else {
      limpiarError(campoCorreo, "error-correo");
    }
  });
  campoCorreo.addEventListener("input", () => limpiarError(campoCorreo, "error-correo"));

  // No se aplica trim() a la contraseña
  campoPassword.addEventListener("blur", () => {
    if (!validarPassword(campoPassword.value)) {
      mostrarError(campoPassword, "error-password", "La contraseña debe tener entre 4 y 10 caracteres.");
    } else {
      limpiarError(campoPassword, "error-password");
    }
  });
  campoPassword.addEventListener("input", () => limpiarError(campoPassword, "error-password"));

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const correo = campoCorreo.value.trim();
    const password = campoPassword.value; // sin trim

    const correoValido = validarCorreo(correo);
    const passwordValido = validarPassword(password);

    if (!correoValido) {
      mostrarError(
        campoCorreo,
        "error-correo",
        "Correo inválido. Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com."
      );
    } else {
      limpiarError(campoCorreo, "error-correo");
    }

    if (!passwordValido) {
      mostrarError(campoPassword, "error-password", "La contraseña debe tener entre 4 y 10 caracteres.");
    } else {
      limpiarError(campoPassword, "error-password");
    }

    if (!correoValido || !passwordValido) {
      form.querySelector(".campo-invalido")?.focus();
      return;
    }

    // ---- Buscar credenciales en empleados y luego en clientes ----
    const empleados = await obtenerEmpleados();
    const clientes = await obtenerClientes();

    const empleadoEncontrado = empleados.find(
      (e) => e.correo.toLowerCase() === correo.toLowerCase() && e.password === password
    );
    const clienteEncontrado = !empleadoEncontrado
      ? clientes.find((c) => c.correo.toLowerCase() === correo.toLowerCase() && c.password === password)
      : null;

    if (!empleadoEncontrado && !clienteEncontrado) {
      mostrarError(campoPassword, "error-password", "Correo o contraseña incorrectos.");
      campoPassword.focus();
      return;
    }

    const sesion = empleadoEncontrado
      ? { tipo: "empleado", correo: empleadoEncontrado.correo, rol: empleadoEncontrado.rol, nombre: empleadoEncontrado.nombre }
      : { tipo: "cliente", correo: clienteEncontrado.correo, rol: "Cliente", nombre: clienteEncontrado.nombre };

    localStorage.setItem("sesionActual", JSON.stringify(sesion));

    const nombre = empleadoEncontrado ? empleadoEncontrado.nombre : clienteEncontrado.nombre;
    mostrarConfirmacionYRedirigir(nombre);
  });

  function mostrarConfirmacionYRedirigir(nombre) {
    const confirmacion = document.getElementById("login-confirmacion");
    if (confirmacion) {
      confirmacion.textContent = `Bienvenido, ${nombre}. Redirigiendo a tu perfil...`;
      confirmacion.hidden = false;
    }
    setTimeout(() => {
      window.location.href = "perfil.html";
    }, 900);
  }
});