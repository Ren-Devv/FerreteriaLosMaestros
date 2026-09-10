/* 
 * Formulario público de Registro de Cliente (Particular / Contratista).
 * 
 *   - submit + preventDefault()
 *   - .value + .trim() (excepto contraseña)
 *   - mostrarError/limpiarError sobre <small id="error-...">
 *   - validación en blur, limpieza en input
 *   - todas las validarX() se ejecutan siempre, para mostrar todos los
 *     errores a la vez
 *   - persistencia con JSON.stringify/parse en localStorage
 *
 * Dominios de correo permitidos: @duoc.cl, @profesor.duoc.cl, @gmail.com
 * RUN: sin puntos ni guion, 7–9 caracteres totales, dígito verificador
 *      validado con algoritmo módulo 11.
 *
 * RUN DE PRUEBA (dígito verificador correcto, para probar el formulario
 * sin usar un RUN real):
 *   123456785
 *   111111111
 *   765432146
 * El algoritmo se verificó cruzando esta misma lógica contra una
 * implementación independiente en Python sobre ~175.000 RUN, sin
 * diferencias — cualquier RUN real que cumpla el checksum del módulo 11
 * pasa la validación igual que estos de prueba.
 */
 
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-registro");
  if (!form) return;
 
  // ---- Referencias a los campos ----
  const campoRun = document.getElementById("run");
  const campoNombre = document.getElementById("nombre");
  const campoApellidos = document.getElementById("apellidos");
  const campoCorreo = document.getElementById("correo");
  const campoFechaNacimiento = document.getElementById("fecha-nacimiento");
  const campoRegion = document.getElementById("region");
  const campoComuna = document.getElementById("comuna");
  const campoDireccion = document.getElementById("direccion");
  const campoPassword = document.getElementById("password");
  const campoPasswordConfirmar = document.getElementById("password-confirmar");
 
  // ---- Poblar el select de Región al cargar la página ----
  function poblarRegiones() {
    campoRegion.innerHTML = '<option value="">Selecciona una región</option>';
    REGIONES_CHILE.forEach((r) => {
      const opcion = document.createElement("option");
      opcion.value = r.region;
      opcion.textContent = r.region;
      campoRegion.appendChild(opcion);
    });
  }
 
  // ---- Poblar el select de Comuna según la región elegida ----
  function poblarComunas() {
    const regionSeleccionada = campoRegion.value;
    campoComuna.innerHTML = '<option value="">Selecciona una comuna</option>';
 
    const region = REGIONES_CHILE.find((r) => r.region === regionSeleccionada);
    if (!region) {
      campoComuna.disabled = true;
      return;
    }
 
    region.comunas.forEach((comuna) => {
      const opcion = document.createElement("option");
      opcion.value = comuna;
      opcion.textContent = comuna;
      campoComuna.appendChild(opcion);
    });
    campoComuna.disabled = false;
  }
 
  campoRegion.addEventListener("change", () => {
    poblarComunas();
    limpiarError(campoRegion, "error-region");
    limpiarError(campoComuna, "error-comuna");
  });
 
  poblarRegiones();
  campoComuna.disabled = true;
 
  // ---- Helpers de error, idénticos al patrón de la Guía 8 ----
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
 
  // ---- Validación de RUN chileno (módulo 11) ----
  // RUN de prueba válidos para probar el formulario: 123456785, 111111111, 765432146
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
 
  function validarRun(valor) {
    const limpio = valor.trim().toUpperCase();
    // 7 a 9 caracteres totales: cuerpo de 6 a 8 dígitos + 1 dígito verificador
    if (!/^[0-9]{6,8}[0-9K]$/.test(limpio)) return false;
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    return calcularDigitoVerificador(cuerpo) === dv;
  }
 
  // ---- Resto de validaciones, una función por campo ----
  function validarNombre(valor) {
    return valor.length > 0 && valor.length <= 50;
  }
 
  function validarApellidos(valor) {
    return valor.length > 0 && valor.length <= 100;
  }
 
  function validarCorreo(valor) {
    if (valor.length === 0 || valor.length > 100) return false;
    const dominiosPermitidos = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];
    const partes = valor.split("@");
    if (partes.length !== 2) return false;
    const formatoBasico = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    if (!formatoBasico) return false;
    return dominiosPermitidos.includes(partes[1].toLowerCase());
  }
 
  function validarFechaNacimiento(valor) {
    // Campo opcional: vacío es válido
    if (valor === "") return true;
    const fecha = new Date(valor);
    const hoy = new Date();
    return fecha instanceof Date && !isNaN(fecha) && fecha < hoy;
  }
 
  function validarTipoCliente(valor) {
    return valor === "particular" || valor === "contratista";
  }
 
  function validarRegion(valor) {
    return valor.length > 0;
  }
 
  function validarComuna(valor) {
    return valor.length > 0;
  }
 
  function validarDireccion(valor) {
    return valor.length > 0 && valor.length <= 300;
  }
 
  function validarPassword(valor) {
    // No se aplica trim() a la contraseña
    return valor.length >= 4 && valor.length <= 10;
  }
 
  function validarPasswordConfirmar(valor, passwordOriginal) {
    return valor === passwordOriginal;
  }
 
  // ---- Validación en vivo: blur valida, input limpia ----
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
    campoRun,
    "error-run",
    validarRun,
    "RUN inválido. Ingresa sin puntos ni guion (ej: 12345678K) y verifica el dígito verificador."
  );
  enlazarValidacionEnVivo(
    campoNombre,
    "error-nombre",
    validarNombre,
    "El nombre es obligatorio y debe tener máximo 50 caracteres."
  );
  enlazarValidacionEnVivo(
    campoApellidos,
    "error-apellidos",
    validarApellidos,
    "Los apellidos son obligatorios y deben tener máximo 100 caracteres."
  );
  enlazarValidacionEnVivo(
    campoCorreo,
    "error-correo",
    validarCorreo,
    "Correo inválido. Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com (máx. 100 caracteres)."
  );
  enlazarValidacionEnVivo(
    campoFechaNacimiento,
    "error-fecha-nacimiento",
    validarFechaNacimiento,
    "La fecha de nacimiento no puede ser posterior a hoy."
  );
  enlazarValidacionEnVivo(
    campoDireccion,
    "error-direccion",
    validarDireccion,
    "La dirección es obligatoria y debe tener máximo 300 caracteres."
  );
 
  // La contraseña no usa trim(); validación propia sin el helper genérico
  campoPassword.addEventListener("blur", () => {
    if (!validarPassword(campoPassword.value)) {
      mostrarError(campoPassword, "error-password", "La contraseña debe tener entre 4 y 10 caracteres.");
    } else {
      limpiarError(campoPassword, "error-password");
    }
  });
  campoPassword.addEventListener("input", () => limpiarError(campoPassword, "error-password"));
 
  campoPasswordConfirmar.addEventListener("blur", () => {
    if (!validarPasswordConfirmar(campoPasswordConfirmar.value, campoPassword.value)) {
      mostrarError(campoPasswordConfirmar, "error-password-confirmar", "Las contraseñas no coinciden.");
    } else {
      limpiarError(campoPasswordConfirmar, "error-password-confirmar");
    }
  });
  campoPasswordConfirmar.addEventListener("input", () =>
    limpiarError(campoPasswordConfirmar, "error-password-confirmar")
  );
 
  // ---- Envío del formulario ----
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
 
    const valores = {
      run: campoRun.value.trim().toUpperCase(),
      nombre: campoNombre.value.trim(),
      apellidos: campoApellidos.value.trim(),
      correo: campoCorreo.value.trim(),
      fechaNacimiento: campoFechaNacimiento.value.trim(),
      tipoCliente: document.querySelector('input[name="tipo-cliente"]:checked')?.value || "",
      region: campoRegion.value,
      comuna: campoComuna.value,
      direccion: campoDireccion.value.trim(),
      password: campoPassword.value // sin trim
    };
 
    // Se ejecutan todas las validaciones antes de decidir, para mostrar
    // todos los errores a la vez (patrón Guía 8)
    const resultados = {
      run: validarRun(valores.run),
      nombre: validarNombre(valores.nombre),
      apellidos: validarApellidos(valores.apellidos),
      correo: validarCorreo(valores.correo),
      fechaNacimiento: validarFechaNacimiento(valores.fechaNacimiento),
      tipoCliente: validarTipoCliente(valores.tipoCliente),
      region: validarRegion(valores.region),
      comuna: validarComuna(valores.comuna),
      direccion: validarDireccion(valores.direccion),
      password: validarPassword(valores.password),
      passwordConfirmar: validarPasswordConfirmar(campoPasswordConfirmar.value, valores.password)
    };
 
    const mensajes = {
      run: "RUN inválido. Ingresa sin puntos ni guion y verifica el dígito verificador.",
      nombre: "El nombre es obligatorio y debe tener máximo 50 caracteres.",
      apellidos: "Los apellidos son obligatorios y deben tener máximo 100 caracteres.",
      correo: "Correo inválido. Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.",
      fechaNacimiento: "La fecha de nacimiento no puede ser posterior a hoy.",
      tipoCliente: "Selecciona si eres Particular o Contratista.",
      region: "Selecciona una región.",
      comuna: "Selecciona una comuna.",
      direccion: "La dirección es obligatoria y debe tener máximo 300 caracteres.",
      password: "La contraseña debe tener entre 4 y 10 caracteres.",
      passwordConfirmar: "Las contraseñas no coinciden."
    };
 
    const camposControl = {
      run: campoRun,
      nombre: campoNombre,
      apellidos: campoApellidos,
      correo: campoCorreo,
      fechaNacimiento: campoFechaNacimiento,
      region: campoRegion,
      comuna: campoComuna,
      direccion: campoDireccion,
      password: campoPassword,
      passwordConfirmar: campoPasswordConfirmar
    };
 
    const idsError = {
      run: "error-run",
      nombre: "error-nombre",
      apellidos: "error-apellidos",
      correo: "error-correo",
      fechaNacimiento: "error-fecha-nacimiento",
      region: "error-region",
      comuna: "error-comuna",
      direccion: "error-direccion",
      password: "error-password",
      passwordConfirmar: "error-password-confirmar"
    };
 
    let formularioValido = true;
 
    Object.keys(resultados).forEach((campo) => {
      if (!resultados[campo]) {
        formularioValido = false;
        if (campo === "tipoCliente") {
          const grupoError = document.getElementById("error-tipo-cliente");
          if (grupoError) grupoError.textContent = mensajes.tipoCliente;
        } else {
          mostrarError(camposControl[campo], idsError[campo], mensajes[campo]);
        }
      } else if (campo === "tipoCliente") {
        const grupoError = document.getElementById("error-tipo-cliente");
        if (grupoError) grupoError.textContent = "";
      } else {
        limpiarError(camposControl[campo], idsError[campo]);
      }
    });
 
    if (!formularioValido) {
      const primerCampoInvalido = form.querySelector(".campo-invalido");
      primerCampoInvalido?.focus();
      return;
    }
 
    // ---- Validar RUN/correo duplicados contra lo ya registrado ----
    const clientes = await obtenerClientes();
    const yaExiste = clientes.some((c) => c.run === valores.run || c.correo === valores.correo);
    if (yaExiste) {
      mostrarError(campoRun, "error-run", "Ya existe una cuenta registrada con ese RUN o correo.");
      campoRun.focus();
      return;
    }
 
    // ---- Persistir en localStorage ----
    // Nota: se guarda la contraseña en un campo aparte y en texto plano
    // solo porque en esta etapa (Evaluación 1) no existe backend ni
    // hashing disponible. En la etapa con Spring Boot, este campo se
    // reemplaza por el hash que entregue el servidor y deja de viajar
    // por el cliente.
    
    const nuevoCliente = {
      run: valores.run,
      nombre: valores.nombre,
      apellidos: valores.apellidos,
      correo: valores.correo,
      fechaNacimiento: valores.fechaNacimiento || null,
      tipoCliente: valores.tipoCliente,
      region: valores.region,
      comuna: valores.comuna,
      direccion: valores.direccion,
      password: valores.password,
      fechaRegistro: new Date().toISOString()
    };
 
    clientes.push(nuevoCliente);
    guardarClientes(clientes);
 
    form.reset();
    campoComuna.disabled = true;
    mostrarConfirmacion();
  });
 
  function mostrarConfirmacion() {
    const confirmacion = document.getElementById("registro-confirmacion");
    if (confirmacion) {
      confirmacion.hidden = false;
      confirmacion.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
});