// assets/js/catalogo.js
// Requiere que productos.js (clases Producto / Catalogo) se cargue antes que este script.

document.addEventListener("DOMContentLoaded", async () => {
  const contenedorTabs = document.querySelector(".tabs-categorias");
  const grilla = document.querySelector("#grilla-productos");
  if (!contenedorTabs || !grilla) return; // esta página no es el catálogo

  const catalogo = new Catalogo();
  await catalogo.cargar();

  const categoriaInicial = new URLSearchParams(window.location.search).get("cat") || "";

  renderizarTabs(categoriaInicial);
  renderizarProductos(catalogo.porCategoria(categoriaInicial));

  function renderizarTabs(categoriaActiva) {
    const todas = [{ slug: "", label: "Todas" }, ...catalogo.categorias];

    contenedorTabs.innerHTML = todas.map(cat => `
      <button
        class="tab${cat.slug === categoriaActiva ? " activo" : ""}"
        role="tab"
        aria-selected="${cat.slug === categoriaActiva}"
        data-categoria="${cat.slug}">
        ${cat.label}
      </button>
    `).join("");

    contenedorTabs.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        contenedorTabs.querySelectorAll(".tab").forEach(t => {
          t.classList.remove("activo");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("activo");
        tab.setAttribute("aria-selected", "true");

        const categoria = tab.dataset.categoria;
        const url = new URL(window.location);
        if (categoria) {
          url.searchParams.set("cat", categoria);
        } else {
          url.searchParams.delete("cat");
        }
        window.history.replaceState({}, "", url);

        renderizarProductos(catalogo.porCategoria(categoria));
      });
    });
  }

  function renderizarProductos(productos) {
    if (productos.length === 0) {
      grilla.innerHTML = `<p class="sin-resultados">No encontramos productos en esta categoría por ahora.</p>`;
      return;
    }

    grilla.innerHTML = productos.map(p => `
      <article class="producto">
        <div class="producto-imagen">
          ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}">` : "Foto producto"}
        </div>
        <div class="producto-cuerpo">
          <p class="producto-categoria">${p.categoriaLabel}</p>
          <h3>${p.nombre}</h3>
          <div class="producto-precio-fila">
            <span class="producto-precio">${p.precioFormateado}</span>
            <span class="producto-stock">${p.textoStock}</span>
          </div>
        </div>
      </article>
    `).join("");
  }
});