const tabs = document.querySelectorAll(".tab");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => {
      t.classList.remove("activo");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("activo");
    tab.setAttribute("aria-selected", "true");

    const categoria = tab.dataset.categoria;
    renderizarProductos(catalogo.porCategoria(categoria));
  });
});