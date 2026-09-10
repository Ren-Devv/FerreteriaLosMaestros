/*
 * Formulario de solicitud de Cuenta Corriente (contratistas/empresas).
 * Mismo patrón de validación que registro.js / login.js / contacto.js
 * (submit+preventDefault, mostrarError/limpiarError, blur valida,
 * input limpia). El RUT usa el mismo algoritmo de dígito verificador
 * (módulo 11) que registro.js.
 *
 * Persistencia: cada solicitud se agrega a la lista guardada en
 * localStorage bajo la clave "solicitudesCuentaCorriente". No hay
 * backend en esta etapa, así que esto solo simula el envío.
 */

const CORREOS_PERMITIDOS_CC = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cuenta-corriente");
  if (!form) return;

  const campoNombreEmpresa = document.getElementById("nombre-empresa");
  const campoRut = document.getElementById("rut-empresa");
  const campoCorreo = document.getElementById("correo-empresa");
  const campoTelefono = document.getElementById("telefono-empresa");
  const campoMonto = document.getElementById("monto-mensual");
  const campoMensaje = document.getElementById("mensaje-cuenta-corriente");
  const campoAceptaCondiciones = document.getElementById("acepta-condiciones");

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

  // ---- RUT chileno (mismo algoritmo módulo 11 que registro.js) ----
  function calcularDigitoVerificador(cuerpo) {
    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i], 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = 11 - (suma % 11);
    if (resto === 11) return "0";
    if (resto === 10) return "K";
    return String(resto);
  }

  function validarRut(valor) {
    const limpio = valor.trim().toUpperCase();
    if (!/^[0-9]{6,8}[0-9K]$/.test(limpio)) return false;
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    return calcularDigitoVerificador(cuerpo) === dv;
  }

  function validarNombreEmpresa(valor) {
    return valor.length > 0 && valor.length <= 100;
  }

  function validarCorreo(valor) {
    if (valor.length === 0 || valor.length > 100) return false;
    const partes = valor.split("@");
    if (partes.length !== 2) return false;
    const formatoBasico = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    if (!formatoBasico) return false;
    return CORREOS_PERMITIDOS_CC.includes(partes[1].toLowerCase());
  }

  function validarTelefono(valor) {
    return /^[0-9]{9}$/.test(valor);
  }

  function validarMonto(valor) {
    return valor.length > 0;
  }

  function validarMensaje(valor) {
    // Campo opcional
    return valor.length <= 500;
  }

  function enlazarValidacionEnVivo(campo, idError, funcionValidadora, mensaje) {
    campo.addEventListener("blur", () => {
      const valor = campo.value.trim();
      if (!funcionValidadora(valor)) {
        mostrarError(campo, idError, mensaje);
      } else {
        limpiarError(campo, idError);
      }
    });
    campo.addEventListener("input", () => limpiarError(campo, idError));
  }

  enlazarValidacionEnVivo(
    campoNombreEmpresa,
    "error-nombre-empresa",
    validarNombreEmpresa,
    "El nombre de la empresa o contratista es obligatorio (máximo 100 caracteres)."
  );
  enlazarValidacionEnVivo(
    campoRut,
    "error-rut-empresa",
    validarRut,
    "RUT inválido. Ingresa sin puntos ni guion (ej: 12345678K) y verifica el dígito verificador."
  );
  enlazarValidacionEnVivo(
    campoCorreo,
    "error-correo-empresa",
    validarCorreo,
    "Correo inválido. Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com."
  );
  enlazarValidacionEnVivo(
    campoTelefono,
    "error-telefono-empresa",
    validarTelefono,
    "Ingresa un teléfono chileno válido (9 dígitos, sin +56)."
  );
  enlazarValidacionEnVivo(
    campoMonto,
    "error-monto-mensual",
    validarMonto,
    "Selecciona un rango de compra mensual estimada."
  );

  campoMensaje.addEventListener("input", () => limpiarError(campoMensaje, "error-mensaje-cuenta-corriente"));

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const valores = {
      nombreEmpresa: campoNombreEmpresa.value.trim(),
      rut: campoRut.value.trim().toUpperCase(),
      correo: campoCorreo.value.trim(),
      telefono: campoTelefono.value.trim(),
      monto: campoMonto.value,
      mensaje: campoMensaje.value.trim(),
      aceptaCondiciones: campoAceptaCondiciones.checked
    };

    const resultados = {
      nombreEmpresa: validarNombreEmpresa(valores.nombreEmpresa),
      rut: validarRut(valores.rut),
      correo: validarCorreo(valores.correo),
      telefono: validarTelefono(valores.telefono),
      monto: validarMonto(valores.monto),
      mensaje: validarMensaje(valores.mensaje)
    };

    const mensajes = {
      nombreEmpresa: "El nombre de la empresa o contratista es obligatorio (máximo 100 caracteres).",
      rut: "RUT inválido. Ingresa sin puntos ni guion y verifica el dígito verificador.",
      correo: "Correo inválido. Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.",
      telefono: "Ingresa un teléfono chileno válido (9 dígitos, sin +56).",
      monto: "Selecciona un rango de compra mensual estimada.",
      mensaje: "El mensaje no puede superar los 500 caracteres."
    };

    const campos = {
      nombreEmpresa: campoNombreEmpresa,
      rut: campoRut,
      correo: campoCorreo,
      telefono: campoTelefono,
      monto: campoMonto,
      mensaje: campoMensaje
    };

    const idsError = {
      nombreEmpresa: "error-nombre-empresa",
      rut: "error-rut-empresa",
      correo: "error-correo-empresa",
      telefono: "error-telefono-empresa",
      monto: "error-monto-mensual",
      mensaje: "error-mensaje-cuenta-corriente"
    };

    let formularioValido = true;

    Object.keys(resultados).forEach((campo) => {
      if (!resultados[campo]) {
        formularioValido = false;
        mostrarError(campos[campo], idsError[campo], mensajes[campo]);
      } else {
        limpiarError(campos[campo], idsError[campo]);
      }
    });

    if (!valores.aceptaCondiciones) {
      formularioValido = false;
    }

    if (!formularioValido) {
      form.querySelector(".campo-invalido")?.focus();
      return;
    }

    // ---- Persistir la solicitud (simulado, sin backend) ----
    const solicitudes = JSON.parse(localStorage.getItem("solicitudesCuentaCorriente") || "[]");
    solicitudes.push({
      nombreEmpresa: valores.nombreEmpresa,
      rut: valores.rut,
      correo: valores.correo,
      telefono: valores.telefono,
      monto: valores.monto,
      mensaje: valores.mensaje || null,
      fechaSolicitud: new Date().toISOString()
    });
    localStorage.setItem("solicitudesCuentaCorriente", JSON.stringify(solicitudes));

    form.reset();
    mostrarConfirmacion();
  });

  function mostrarConfirmacion() {
    const confirmacion = document.getElementById("cuenta-corriente-confirmacion");
    if (confirmacion) {
      confirmacion.hidden = false;
      confirmacion.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
});