const API = 'http://localhost:3000/api/productos';

// ========== CARGAR PRODUCTOS ==========
async function cargarProductos() {
  const buscar = document.getElementById('buscar').value;
  const categoria = document.getElementById('filtro-categoria').value;

  let url = API;
  const params = [];
  if (buscar) params.push(`buscar=${buscar}`);
  if (categoria) params.push(`categoria=${categoria}`);
  if (params.length) url += '?' + params.join('&');

  try {
    const res = await fetch(url);
    const productos = await res.json();
    mostrarProductos(productos);
    actualizarDashboard(productos);
  } catch (err) {
    mostrarToast('Error al cargar productos', 'error');
  }
}

// ========== MOSTRAR EN TABLA ==========
function mostrarProductos(productos) {
  const tbody = document.getElementById('tabla-productos');

  if (productos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:30px; color:#aaa;">
          No hay productos registrados
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = productos.map(p => `
    <tr>
      <td>${p.nombre}</td>
      <td>${p.marca}</td>
      <td>${p.categoria}</td>
      <td>$${p.precio.toLocaleString('es-CO')}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn-editar" onclick="editarProducto('${p._id}')">✏️ Editar</button>
        <button class="btn-eliminar" onclick="eliminarProducto('${p._id}')">🗑️ Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// ========== DASHBOARD ==========
function actualizarDashboard(productos) {
  document.getElementById('total-productos').textContent = productos.length;

  const categorias = new Set(productos.map(p => p.categoria));
  document.getElementById('total-categorias').textContent = categorias.size;

  const totalStock = productos.reduce((sum, p) => sum + p.stock, 0);
  document.getElementById('total-stock').textContent = totalStock;

  const totalValor = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  document.getElementById('total-valor').textContent = '$' + totalValor.toLocaleString('es-CO');
}

// ========== MODAL ==========
function abrirModal() {
  document.getElementById('modal-titulo').textContent = 'Nuevo Producto';
  document.getElementById('producto-id').value = '';
  document.getElementById('nombre').value = '';
  document.getElementById('marca').value = '';
  document.getElementById('categoria').value = '';
  document.getElementById('precio').value = '';
  document.getElementById('stock').value = '';
  document.getElementById('descripcion').value = '';
  document.getElementById('modal').classList.remove('oculto');
}

function cerrarModal() {
  document.getElementById('modal').classList.add('oculto');
}

// ========== GUARDAR (CREAR O EDITAR) ==========
async function guardarProducto() {
  const id = document.getElementById('producto-id').value;
  const nombre = document.getElementById('nombre').value.trim();
  const marca = document.getElementById('marca').value.trim();
  const categoria = document.getElementById('categoria').value;
  const precio = document.getElementById('precio').value;
  const stock = document.getElementById('stock').value;
  const descripcion = document.getElementById('descripcion').value.trim();

  // Validaciones
  if (!nombre) return mostrarToast('El nombre es obligatorio', 'error');
  if (!marca) return mostrarToast('La marca es obligatoria', 'error');
  if (!categoria) return mostrarToast('Selecciona una categoría', 'error');
  if (!precio || precio <= 0) return mostrarToast('El precio debe ser mayor a 0', 'error');
  if (!stock || stock < 0) return mostrarToast('El stock no puede ser negativo', 'error');

  const datos = { nombre, marca, categoria, precio: Number(precio), stock: Number(stock), descripcion };

  try {
    if (id) {
      // Editar
      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      mostrarToast('Producto actualizado ✅', 'exito');
    } else {
      // Crear
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      mostrarToast('Producto creado ✅', 'exito');
    }
    cerrarModal();
    cargarProductos();
  } catch (err) {
    mostrarToast('Error al guardar producto', 'error');
  }
}

// ========== EDITAR ==========
async function editarProducto(id) {
  try {
    const res = await fetch(API);
    const productos = await res.json();
    const p = productos.find(x => x._id === id);

    document.getElementById('modal-titulo').textContent = 'Editar Producto';
    document.getElementById('producto-id').value = p._id;
    document.getElementById('nombre').value = p.nombre;
    document.getElementById('marca').value = p.marca;
    document.getElementById('categoria').value = p.categoria;
    document.getElementById('precio').value = p.precio;
    document.getElementById('stock').value = p.stock;
    document.getElementById('descripcion').value = p.descripcion || '';
    document.getElementById('modal').classList.remove('oculto');
  } catch (err) {
    mostrarToast('Error al cargar producto', 'error');
  }
}

// ========== ELIMINAR ==========
async function eliminarProducto(id) {
  if (!confirm('¿Segura que quieres eliminar este producto?')) return;

  try {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    mostrarToast('Producto eliminado 🗑️', 'exito');
    cargarProductos();
  } catch (err) {
    mostrarToast('Error al eliminar producto', 'error');
  }
}

// ========== TOAST ==========
function mostrarToast(mensaje, tipo = 'exito') {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.className = `toast ${tipo}`;
  toast.classList.remove('oculto');
  setTimeout(() => toast.classList.add('oculto'), 3000);
}

// ========== EVENTOS ==========
document.getElementById('buscar').addEventListener('input', cargarProductos);
document.getElementById('filtro-categoria').addEventListener('change', cargarProductos);

// Cerrar modal al hacer clic fuera
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) cerrarModal();
});

// Cargar al inicio
cargarProductos();