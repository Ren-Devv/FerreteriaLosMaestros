const CORREOS_PERMITIDOS = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];
 
/**
 * Crea 2 cuentas de Empleado de prueba la primera vez que se carga la
 * página, para poder probar los roles Administrador/Vendedor mientras
 * el mantenedor de Usuario del admin todavía no existe.
 * TODO: eliminar esta semilla cuando el mantenedor de Usuario permita
 * crear empleados reales desde la vista Administrador.
 */
function sembrarEmpleadosDePrueba() {
  if (localStorage.getItem("empleados")) return;
 
  const empleadosDePrueba = [
    {
      nombre: "Admin",
      apellidos: "De Prueba",
      correo: "admin@profesor.duoc.cl",
      password: "admin1234",
      rol: "Administrador"
    },
    {
      nombre: "Vendedor",
      apellidos: "De Prueba",
      correo: "vendedor@duoc.cl",
      password: "vend1234",
      rol: "Vendedor"
    }
  ];
 
  localStorage.setItem("empleados", JSON.stringify(empleadosDePrueba));
}
 
document.addEventListener("DOMContentLoaded", () => {
  sembrarEmpleadosDePrueba();
 
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
 
  form.addEventListener("submit", (evento) => {
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
    const empleados = JSON.parse(localStorage.getItem("empleados") || "[]");
    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
 
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
      ? { tipo: "empleado", correo: empleadoEncontrado.correo, rol: empleadoEncontrado.rol }
      : { tipo: "cliente", correo: clienteEncontrado.correo, rol: "Cliente" };
 
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
