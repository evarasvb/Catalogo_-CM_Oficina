// Aplicación del cotizador de Convenio Marco

document.addEventListener('DOMContentLoaded', () => {
  const qInput = document.getElementById('q');
  const selProv = document.getElementById('f_proveedor');
  const selReg = document.getElementById('f_region');
  const selMarca = document.getElementById('f_marca');
  const listEl = document.getElementById('list');
  const tplItem = document.getElementById('tpl-item');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalsEl = document.getElementById('cart-totals');
  const btnCotizar = document.getElementById('btn-cotizar');
  const btnVaciar = document.getElementById('btn-vaciar');

  let productos = [];
  const cart = {};

  // Cargar el catálogo desde el CSV
  Papa.parse('catalogo_unico.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      productos = results.data;
      init();
    },
    error: function(err) {
      console.error(err);
    }
  });

  function init() {
    // Poblamos los filtros
    const provSet = new Set();
    const regSet = new Set();
    const marcaSet = new Set();
    productos.forEach(p => {
      if (p.Proveedor) provSet.add(p.Proveedor);
      if (p.Region) regSet.add(p.Region);
      if (p.Marca) marcaSet.add(p.Marca);
    });
    fillSelect(selProv, Array.from(provSet).sort());
    fillSelect(selReg, Array.from(regSet).sort());
    fillSelect(selMarca, Array.from(marcaSet).sort());

    // Eventos
    qInput.addEventListener('input', renderList);
    selProv.addEventListener('change', renderList);
    selReg.addEventListener('change', renderList);
    selMarca.addEventListener('change', renderList);

    renderList();
    updateCartUI();

    // Manejar clic en botón "Vaciar carrito"
    btnVaciar.addEventListener('click', () => {
      // Verificamos si hay elementos
      const keys = Object.keys(cart);
      if (keys.length === 0) return;
      if (confirm('¿Está seguro de eliminar todos los productos del carrito?')) {
        keys.forEach(k => delete cart[k]);
        updateCartUI();
      }
    });
  }

  function fillSelect(select, items) {
    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      select.appendChild(opt);
    });
  }

  function renderList() {
    listEl.innerHTML = '';
    const q = qInput.value.toLowerCase();
    const prov = selProv.value;
    const reg = selReg.value;
    const marca = selMarca.value;
    productos.forEach(p => {
      if (prov && p.Proveedor !== prov) return;
      if (reg && p.Region !== reg) return;
      if (marca && p.Marca !== marca) return;
      if (q) {
        const hay = (p.Producto || '').toLowerCase().includes(q) ||
                    (p.Marca || '').toLowerCase().includes(q) ||
                    (p.Tipo_Producto || '').toLowerCase().includes(q);
        if (!hay) return;
      }
      const clone = tplItem.content.cloneNode(true);
      clone.querySelector('.name').textContent = p.Producto;
      clone.querySelector('.marca').textContent = p.Marca;
      clone.querySelector('.tipo').textContent = p.Tipo_Producto;
      clone.querySelector('.region').textContent = p.Region;
      clone.querySelector('.proveedor').textContent = p.Proveedor;
      const imgEl = clone.querySelector('.img');
      if (p.Imagen && p.Imagen !== 'null') {
        imgEl.src = p.Imagen;
        imgEl.style.display = '';
      } else {
        imgEl.src = '';
        imgEl.style.display = 'none';
      }
      const qtyInput = clone.querySelector('.qty');
      const addBtn = clone.querySelector('.add');
      addBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value);
        if (!qty || qty <= 0) return;
        addToCart(p, qty);
        qtyInput.value = 1;
      });
      listEl.appendChild(clone);
    });
  }

  function getCartKey(p) {
    return `${p.RUT}|${p.ID_Producto}|${p.Region}`;
  }

  function addToCart(p, qty) {
    const key = getCartKey(p);
    if (!cart[key]) {
      cart[key] = { item: p, qty: 0 };
    }
    cart[key].qty += qty;
    updateCartUI();
  }

  function updateCartUI() {
    cartItemsEl.innerHTML = '';
    cartTotalsEl.innerHTML = '';
    const keys = Object.keys(cart);
    if (keys.length === 0) {
      cartItemsEl.textContent = 'No hay productos en el carrito.';
      return;
    }
    // Agrupamos por proveedor
    const grupos = {};
    keys.forEach(key => {
      const { item, qty } = cart[key];
      const prov = item.Proveedor;
      if (!grupos[prov]) grupos[prov] = [];
      grupos[prov].push({ item, qty });
    });
    let totalGeneral = 0;
    for (const prov in grupos) {
      const div = document.createElement('div');
      div.className = 'cart-group';
      const title = document.createElement('div');
      title.textContent = prov;
      title.style.fontWeight = '600';
      div.appendChild(title);
      let subtotal = 0;
      grupos[prov].forEach(entry => {
        const p = entry.item;
        const qty = entry.qty;
        const row = document.createElement('div');
        row.className = 'cart-item';
        // Nombre del producto (recortado si es muy largo)
        const nameSpan = document.createElement('span');
        nameSpan.textContent = p.Producto ? p.Producto.slice(0, 40) : '';
        row.appendChild(nameSpan);
        // Cantidad solicitada
        const qtySpan = document.createElement('span');
        qtySpan.textContent = qty;
        qtySpan.style.textAlign = 'right';
        row.appendChild(qtySpan);
        // Botón para eliminar este producto del carrito
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
          const keyToRemove = getCartKey(p);
          delete cart[keyToRemove];
          updateCartUI();
        });
        row.appendChild(removeBtn);
        div.appendChild(row);
        const price = parseFloat(p.Precio);
        if (!isNaN(price)) {
          subtotal += price * qty;
        }
      });
      cartItemsEl.appendChild(div);
      if (subtotal > 0) totalGeneral += subtotal;
    }
    if (totalGeneral > 0) {
      cartTotalsEl.textContent = `Total: ${totalGeneral.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}`;
    }
  }

  btnCotizar.addEventListener('click', () => {
    const keys = Object.keys(cart);
    if (keys.length === 0) {
      alert('No hay productos en el carrito.');
      return;
    }
    const win = window.open('', '_blank');
    let html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Cotización</title>
<style>
body { font-family: sans-serif; padding:20px; color:#333; }
h1 { margin-top:0; }
table { width:100%; border-collapse: collapse; margin-bottom:20px; }
th, td { border:1px solid #aaa; padding:6px; }
th { background:#ddd; }
</style>
</head>
<body>
<h1>Cotización</h1>
`;
    // Agrupamos por proveedor con RUT
    const groups2 = {};
    keys.forEach(key => {
      const { item, qty } = cart[key];
      const provLabel = `${item.Proveedor} (${item.RUT})`;
      if (!groups2[provLabel]) groups2[provLabel] = [];
      groups2[provLabel].push({ item, qty });
    });
    let totalGeneral = 0;
    for (const prov in groups2) {
      html += `<h2>${prov}</h2>`;
      html += '<table><thead><tr><th>ID Producto</th><th>Producto</th><th>Tipo</th><th>Región</th><th>Marca</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th></tr></thead><tbody>';
      let subtotal = 0;
      groups2[prov].forEach(entry => {
        const p = entry.item;
        const qty = entry.qty;
        const price = parseFloat(p.Precio);
        const priceStr = isNaN(price) ? '-' : price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
        const rowSubtotal = isNaN(price) ? null : price * qty;
        if (!isNaN(price)) subtotal += rowSubtotal;
        html += `<tr><td>${p.ID_Producto}</td><td>${p.Producto}</td><td>${p.Tipo_Producto}</td><td>${p.Region}</td><td>${p.Marca}</td><td style="text-align:right;">${qty}</td><td style="text-align:right;">${priceStr}</td><td style="text-align:right;">${rowSubtotal ? rowSubtotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) : ''}</td></tr>`;
      });
      html += '</tbody></table>';
      if (subtotal > 0) {
        html += `<p><strong>Subtotal ${prov}:</strong> ${subtotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>`;
        totalGeneral += subtotal;
      }
    }
    if (totalGeneral > 0) {
      html += `<h2>Total General: ${totalGeneral.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</h2>`;
    }
    html += '<p>Gracias por su compra. Por favor envíe esta cotización al proveedor correspondiente para generar la orden de compra.</p>';
    html += '</body></html>';
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  });
});
