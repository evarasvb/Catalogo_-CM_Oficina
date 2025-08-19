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

  // Logo del proveedor para insertar en la cotización.
  // Se utiliza una data URI en base64 para evitar solicitudes externas y garantizar
  // que la imagen se incruste correctamente en el PDF generado. Este valor se
  // genera a partir del primer fotograma del video de logo proporcionado y
  // codificado a base64 (véase logo_base64.txt en el repositorio). Si se desea
  // actualizar el logo, reemplace la cadena a continuación con una nueva
  // representación base64 y mantenga el prefijo "data:image/png;base64,".
  const LOGO_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACoCAIAAADVSURYAAAgAElEQVR4AezBB6Dd4+H/8ffn+Z5z7sq9WSJIUaNUUaNGUaNq1ai99fD5//kz9eH31e4P1Ah9O+++fn/rB//33n7+l/9u5v333nPd9+3V/vvv33P9mIkyZPnz58/f6rT39/Xf/33n7/R0tnvfv31/9GHj1q1bN21cvX/57//27c/bt05//u3P3v3Lf/7e9+//9t+//4+g/A0SZIkSVLzo/S+ffrl318/ffv29e/f//tn3//w82f+7+9fHevfj07dvB40aN39/kvPrt77/94wMPbbffrH/6++++33/DlER8ePHnyxI3d//t7Dd395+/Hbt28f48dcf+tP/IcmW9r06ZPnzp16vJl7/v2/H//7yOO++75/7zX33ve/vf7P/8s+94Pl7//ye//z52HDhkvePf/Ez/9x9+jz+oEGDhtV9o9HR2MWvXr9+vxl9d//7e/exff/Hacq/dsYdygU+dOnXrrza98Hrl11kz77rH/2uefv/nXp///f/8LPzt97H/w1/67Nc/+se9+/vg4PDk/znFhxz/Uc3n//PfvoHDh06dOHz869+H73/1373y+Mvffzbbb2396FL17S9/8bnf/+SvflwPnz582apcuXdvfM2fO//zT/53t84Mjf6/QYMGyff/s7du/efPn2ZPf92cvP/jr7un24pfvn/u7EhERq1b98WY/X4++8+fPHj+mPP9/p/PW2I44/HD3/88I7/2e5n37/y6vFAt3uefPh08tSbN++87bfvnXjwwQMXL0kSe33Pk9VB4tx0sa6a99+Yu/f/9oBj9nPfbeeyy/f/yyqeeOZw9+ODu3bsffXxcN4//fHjzzb/yb/5x5nHny0Uef/7ua9v+y3PnnXt6/fXr37e/n68MHD16/f33R8/Pnb6PfvO8RJY8eOTP3333/b3nj737vvvufT/3r//cXvvd92++/77n3/+/7Xv/zFm5+b/xZs379aWwQtPZeO0f//k739Ov13+ClG2/+uhr47zZ90M8evfcvR8e2fGD/7wcE3vzHeWVmZmbzA+Bvc+/GN2B+K/7v//Pb55+3/d3t++RP/98dbMiHKfGzZiuv6szHkvfvdXxP7ufXXnW0yZYMMOPf5mwvv3duzfYY3+37+CQf2H9/8fHDx2Mzg+Lv//8lU6dO65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';

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
<img src="${LOGO_DATA_URI}" alt="Logo" style="max-width:200px; margin-bottom:10px;"/>
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
    // Información de contacto presentada de manera discreta al final de la cotización. Puede modificar los datos de contacto aquí si cambian.
    html += '<p style="font-size:12px; color:#555;">Contacto: Enrique Varas B. – 229059577 – <a href="mailto:contacto@firmavb.cl">contacto@firmavb.cl</a> | Mary Carmen de La Barre – +569&nbsp;2896&nbsp;3160 – <a href="mailto:cm@firmavb.cl">cm@firmavb.cl</a></p>';
    html += '</body></html>';
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  });
});
