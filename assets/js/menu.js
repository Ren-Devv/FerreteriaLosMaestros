const botonMenu = document.querySelector("#boton-menu");
const menuPrincipal = document.querySelector("#menu-principal");

function alternarMenu() {
  const menuAbierto = menuPrincipal.classList.toggle("abierto");

  botonMenu.setAttribute(
    "aria-expanded",
    String(menuAbierto)
  );
}

botonMenu.addEventListener("click", alternarMenu);

// ---- Submenú "Categorías" (desplegable dentro del menú principal) ----
const botonCategorias = document.querySelector("#boton-categorias");
const submenuCategorias = document.querySelector("#submenu-categorias");

function alternarSubmenu() {
  const submenuAbierto = submenuCategorias.classList.toggle("abierto");
  botonCategorias.setAttribute("aria-expanded", String(submenuAbierto));
}

function cerrarSubmenu() {
  submenuCategorias.classList.remove("abierto");
  botonCategorias.setAttribute("aria-expanded", "false");
}

if (botonCategorias && submenuCategorias) {
  botonCategorias.addEventListener("click", (evento) => {
    evento.stopPropagation();
    alternarSubmenu();
  });

  // En escritorio el submenú se despliega como popover: se cierra si se
  // hace clic fuera de él.
  document.addEventListener("click", (evento) => {
    const clicFueraDelSubmenu =
      !submenuCategorias.contains(evento.target) && !botonCategorias.contains(evento.target);
    if (clicFueraDelSubmenu && submenuCategorias.classList.contains("abierto")) {
      cerrarSubmenu();
    }
  });

  // Cerrar con Escape, devolviendo el foco al botón que lo abrió.
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && submenuCategorias.classList.contains("abierto")) {
      cerrarSubmenu();
      botonCategorias.focus();
    }
  });
}