// assets/js/productos.js
// Clases del catálogo: Producto (un ítem) y Catalogo (colección + carga desde JSON).

class Producto {
  constructor({ id, nombre, categoria, categoriaLabel, subcategoria, marca, unidad, precio, stock, stockMinimo, imagen }) {
    this.id = id;
    this.nombre = nombre;
    this.categoria = categoria;
    this.categoriaLabel = categoriaLabel;
    this.subcategoria = subcategoria;
    this.marca = marca;
    this.unidad = unidad;
    this.precio = precio;
    this.stock = stock;
    this.stockMinimo = stockMinimo;
    this.imagen = imagen || null;
  }

  get disponible() {
    return this.stock > 0;
  }

  get stockCritico() {
    return this.stock > 0 && this.stock <= this.stockMinimo;
  }

  get precioFormateado() {
    return this.precio.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
  }

  get textoStock() {
    if (!this.disponible) return "Sin stock";
    if (this.stockCritico) return "Últimas unidades";
    return "Stock disponible";
  }
}

class Catalogo {
  constructor() {
    this.productos = [];
    this.categorias = [];
  }

  async cargar(rutaProductos = "assets/data/productos.json", rutaCategorias = "assets/data/categorias.json") {
    const [respProductos, respCategorias] = await Promise.all([
      fetch(rutaProductos),
      fetch(rutaCategorias)
    ]);
    const datosProductos = await respProductos.json();
    const datosCategorias = await respCategorias.json();

    this.productos = datosProductos.map(p => new Producto(p));
    this.categorias = datosCategorias;
    return this.productos;
  }

  porCategoria(slugCategoria) {
    if (!slugCategoria) return this.productos;
    return this.productos.filter(p => p.categoria === slugCategoria);
  }

  buscarPorId(id) {
    return this.productos.find(p => p.id === id);
  }

  buscarPorTexto(texto) {
    const t = texto.toLowerCase();
    return this.productos.filter(p => p.nombre.toLowerCase().includes(t));
  }
}