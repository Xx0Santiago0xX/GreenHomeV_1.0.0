// ============================================
// main.js - Green Home Funcionalidades Completas
// ============================================

// ============================================
// 0. DETECTAR PÁGINA ACTIVA EN NAVBAR
// ============================================
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Remover clase active de todos
        link.classList.remove('active');
        
        // Si el href coincide con la página actual
        if (href === currentPage) {
            link.classList.add('active');
        }
        
        // Caso especial para index.html
        if (currentPage === '' || currentPage === 'index.html') {
            if (href === 'index.html') {
                link.classList.add('active');
            }
        }
    });
}

// ============================================
// 1. MENÚ HAMBURGUESA
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Cerrar menú al hacer scroll
    window.addEventListener('scroll', () => {
        if (navMenu && navMenu.classList.contains('active')) {
            if (hamburger) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });

    // ============================================
    // 0. DETECTAR PÁGINA ACTIVA EN NAVBAR
    // ============================================
    setActiveNavLink();

    // ============================================
    // 2. INICIALIZAR CARRITO
    // ============================================
    actualizarContadorCarrito();
    if (document.querySelector('.cart-content')) {
        actualizarVistaCarrito();
    }

    // ============================================
    // 3. CARGAR PRODUCTOS Y FILTROS
    // ============================================
    if (document.querySelector('.products-grid')) {
        cargarProductos();
    }

    // Si hay filtros en la página, inicializarlos
    if (document.querySelector('.filter-btn')) {
        initProductFilters();
    }

    // ============================================
    // 4. FILTROS DE GALERÍA
    // ============================================
    initGalleryFilters();

    // ============================================
    // 5. FAQ TOGGLE
    // ============================================
    initFAQ();

    // ============================================
    // 6. FORMULARIO DE CONTACTO
    // ============================================
    initContactForm();

    // ============================================
    // 7. BÚSQUEDA
    // ============================================
    initSearch();

    console.log('🌿 Green Home - Todos los módulos cargados correctamente');
});

// ============================================
// 7. CARRITO DE COMPRAS
// ============================================
let carrito = JSON.parse(localStorage.getItem('carritoGreenHome')) || [];

function agregarAlCarrito(id, nombre, precio) {
    const itemExistente = carrito.find(item => item.id === id);
    
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }

    localStorage.setItem('carritoGreenHome', JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarNotificacion(`✅ ${nombre} agregado al carrito`);
}

function quitarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carritoGreenHome', JSON.stringify(carrito));
    actualizarContadorCarrito();
    actualizarVistaCarrito();
}

function actualizarCantidad(id, nuevaCantidad) {
    const item = carrito.find(item => item.id === id);
    if (item) {
        if (nuevaCantidad <= 0) {
            quitarDelCarrito(id);
        } else {
            item.cantidad = nuevaCantidad;
            localStorage.setItem('carritoGreenHome', JSON.stringify(carrito));
            actualizarContadorCarrito();
            actualizarVistaCarrito();
        }
    }
}

function actualizarContadorCarrito() {
    const contadores = document.querySelectorAll('.cart-counter');
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    contadores.forEach(contador => {
        contador.textContent = total;
        contador.style.display = total > 0 ? 'flex' : 'flex';
    });
}

function obtenerTotalCarrito() {
    return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
}

function actualizarVistaCarrito() {
    const container = document.querySelector('.cart-content');
    if (!container) return;

    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="empty-icon">🛒</div>
                <h2>Tu carrito está vacío</h2>
                <p>¡Explora nuestros productos y comienza tu huerto hoy!</p>
                <a href="productos.html" class="btn-primary">🌱 Explorar productos</a>
            </div>
        `;
        return;
    }

    const total = obtenerTotalCarrito();
    const envio = total >= 500 ? 0 : 80;
    const totalFinal = total + envio;

    let html = `
        <div class="cart-items-list">
    `;

    carrito.forEach(item => {
        html += `
            <div class="cart-item-row" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="images/productos/default-product.jpg" alt="${item.nombre}" loading="lazy" onerror="this.src='images/default-product.jpg'">
                </div>
                <div class="cart-item-details">
                    <h4>${item.nombre}</h4>
                    <span class="item-price">$${item.precio.toFixed(2)} MXN</span>
                </div>
                <div class="cart-item-actions">
                    <button class="btn-qty" onclick="actualizarCantidad('${item.id}', ${item.cantidad - 1})">-</button>
                    <span class="item-qty">${item.cantidad}</span>
                    <button class="btn-qty" onclick="actualizarCantidad('${item.id}', ${item.cantidad + 1})">+</button>
                    <button class="btn-remove" onclick="quitarDelCarrito('${item.id}')">✕</button>
                </div>
            </div>
        `;
    });

    html += `
        </div>
        <div class="cart-summary">
            <div class="cart-summary-row">
                <span>Subtotal</span>
                <span>$${total.toFixed(2)} MXN</span>
            </div>
            <div class="cart-summary-row">
                <span>Envío</span>
                <span>${envio === 0 ? 'Gratis 🎉' : '$' + envio.toFixed(2) + ' MXN'}</span>
            </div>
            ${envio > 0 ? `
                <div class="cart-summary-row free-shipping">
                    <span>💡 Faltan $${(500 - total).toFixed(2)} para envío gratis</span>
                </div>
            ` : ''}
            <div class="cart-summary-row total">
                <span>Total</span>
                <span class="total-price">$${totalFinal.toFixed(2)} MXN</span>
            </div>
        </div>
        <div class="cart-actions">
            <a href="productos.html" class="btn-secondary">← Seguir comprando</a>
            <button onclick="mostrarModalPago()" class="btn-primary btn-pay-cart">
                💳 Proceder al pago → $${totalFinal.toFixed(2)}
            </button>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// 8. PROCESAR PEDIDO
// ============================================
async function procesarPedido() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'error');
        return;
    }

    mostrarModalCliente();
}

function mostrarModalCliente() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'clienteModal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="cerrarModal()">✕</button>
            <h2>📝 Información de contacto</h2>
            <p>Completa tus datos para procesar tu pedido</p>
            <form id="clienteForm" onsubmit="enviarPedido(event)">
                <div class="form-group">
                    <label for="clienteNombre">Nombre completo *</label>
                    <input type="text" id="clienteNombre" required placeholder="Tu nombre completo">
                </div>
                <div class="form-group">
                    <label for="clienteEmail">Correo electrónico *</label>
                    <input type="email" id="clienteEmail" required placeholder="tu@email.com">
                </div>
                <div class="form-group">
                    <label for="clienteTelefono">Teléfono</label>
                    <input type="tel" id="clienteTelefono" placeholder="55 1234 5678">
                </div>
                <div class="form-group">
                    <label for="clienteDireccion">Dirección de envío *</label>
                    <textarea id="clienteDireccion" required placeholder="Calle, número, colonia, ciudad, CP"></textarea>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Confirmar pedido ✅</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function cerrarModal() {
    const modal = document.getElementById('clienteModal');
    if (modal) modal.remove();
}

async function enviarPedido(event) {
    event.preventDefault();
    
    const formData = {
        nombre: document.getElementById('clienteNombre').value,
        email: document.getElementById('clienteEmail').value,
        telefono: document.getElementById('clienteTelefono').value,
        direccion: document.getElementById('clienteDireccion').value
    };

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.textContent = '⏳ Procesando...';
    submitBtn.disabled = true;

    try {
        // Crear cliente
        const clienteResponse = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: formData.nombre,
                email: formData.email,
                telefono: formData.telefono
            })
        });

        const clienteResult = await clienteResponse.json();
        if (!clienteResult.success) {
            throw new Error('Error al crear cliente');
        }

        // Crear pedido
        const items = carrito.map(item => ({
            producto_id: parseInt(item.id),
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad
        }));

        const total = obtenerTotalCarrito();

        const pedidoResponse = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clienteId: clienteResult.id,
                items: items,
                total: total
            })
        });

        const pedidoResult = await pedidoResponse.json();

        if (pedidoResult.success) {
            // Limpiar carrito
            carrito = [];
            localStorage.setItem('carritoGreenHome', JSON.stringify(carrito));
            actualizarContadorCarrito();
            
            // Cerrar modal
            cerrarModal();
            
            // Mostrar éxito
            mostrarNotificacion('🎉 ¡Pedido realizado con éxito! Te contactaremos pronto.');
            actualizarVistaCarrito();
        } else {
            throw new Error(pedidoResult.error || 'Error al crear pedido');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('❌ Error al procesar el pedido. Intenta de nuevo.', 'error');
        submitBtn.textContent = 'Confirmar pedido ✅';
        submitBtn.disabled = false;
    }
}

// ============================================
// 9. CARGAR PRODUCTOS DESDE API (ACTUALIZADO)
// ============================================
async function cargarProductos() {
    const container = document.getElementById('productosGrid') || document.querySelector('.products-grid');
    if (!container) return;

    try {
        container.innerHTML = `
            <div class="loading-spinner" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #C8E6C9; border-top: 4px solid #2E7D32; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 16px; color: #4A7A4A;">Cargando productos...</p>
            </div>
        `;

        const response = await fetch('/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const productos = await response.json();
        
        if (productos.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="font-size: 1.2rem; color: #4A7A4A;">No hay productos disponibles en este momento</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        productos.forEach((producto) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            const categoria = producto.categoria ? producto.categoria.toLowerCase() : 'otros';
            card.dataset.category = categoria;
            
            const badgeText = producto.stock > 10 ? 'Disponible' : 
                             producto.stock > 0 ? 'Últimas unidades' : 'Agotado';
            const badgeClass = producto.stock > 10 ? 'badge-available' : 
                              producto.stock > 0 ? 'badge-limited' : 'badge-soldout';

            let categoryIcon = '🌱';
            if (categoria === 'kits') categoryIcon = '🌱';
            else if (categoria === 'semillas') categoryIcon = '🌾';
            else if (categoria === 'macetas') categoryIcon = '🪴';
            else if (categoria === 'accesorios') categoryIcon = '🧤';

            card.innerHTML = `
                <div class="product-image">
                    <img src="${producto.imagen_url || 'images/default-product.jpg'}" 
                         alt="${producto.nombre}" 
                         loading="lazy"
                         onerror="this.src='images/default-product.jpg'">
                    <span class="product-badge ${badgeClass}">${badgeText}</span>
                    <span class="product-category-tag">${categoryIcon} ${producto.categoria || 'Otros'}</span>
                </div>
                <div class="product-info">
                    <h3>${producto.nombre}</h3>
                    <p class="product-desc">${producto.descripcion || 'Sin descripción'}</p>
                    <div class="product-footer">
                        <span class="product-price">$${producto.precio.toFixed(2)} MXN</span>
                        ${producto.stock > 0 ? 
                            `<button class="btn-small btn-add-cart" 
                                data-id="${producto.id}" 
                                data-nombre="${producto.nombre}" 
                                data-precio="${producto.precio}">
                                Agregar
                            </button>` :
                            `<span class="btn-small btn-disabled">Agotado</span>`
                        }
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Event listeners para agregar al carrito
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.dataset.id;
                const nombre = this.dataset.nombre;
                const precio = parseFloat(this.dataset.precio);
                agregarAlCarrito(id, nombre, precio);
            });
        });

        // Aplicar filtro inicial si existe en URL
        aplicarFiltroURL();

    } catch (error) {
        console.error('Error al cargar productos:', error);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="color: #d32f2f;">Error al cargar los productos. Por favor, intenta de nuevo.</p>
                <button onclick="cargarProductos()" class="btn-primary" style="margin-top: 16px;">Reintentar</button>
            </div>
        `;
    }
}

// ============================================
// 11. APLICAR FILTRO DESDE URL
// ============================================
function aplicarFiltroURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('categoria');
    
    if (categoria) {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            if (btn.dataset.filter === categoria.toLowerCase()) {
                btn.click();
            }
        });
    }
}

// ============================================
// 10. FILTROS DE PRODUCTOS (ACTUALIZADO)
// ============================================
function initProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length === 0) return;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            const products = document.querySelectorAll('.product-card');
            
            // Actualizar botón activo
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filtrar productos
            products.forEach(product => {
                if (filter === 'all') {
                    product.style.display = 'block';
                    product.style.opacity = '1';
                } else {
                    const category = product.dataset.category;
                    if (category === filter) {
                        product.style.display = 'block';
                        product.style.opacity = '1';
                    } else {
                        product.style.display = 'none';
                        product.style.opacity = '0';
                    }
                }
            });

            // Mostrar mensaje si no hay productos
            const container = document.querySelector('.products-grid');
            const visibleProducts = document.querySelectorAll('.product-card[style*="display: block"]');
            
            // Remover mensaje anterior
            const oldMessage = container.querySelector('.no-products-message');
            if (oldMessage) oldMessage.remove();

            if (visibleProducts.length === 0 && products.length > 0) {
                const message = document.createElement('div');
                message.className = 'no-products-message';
                message.style.cssText = `
                    grid-column: 1/-1;
                    text-align: center;
                    padding: 40px;
                    color: var(--color-text-light);
                `;
                message.innerHTML = `
                    <p style="font-size: 1.2rem;">😕 No hay productos en esta categoría</p>
                    <p style="font-size: 0.95rem; margin-top: 8px;">Pronto tendremos más variedad</p>
                `;
                container.appendChild(message);
            }
        });
    });
}

// ============================================
// 12. BÚSQUEDA DE PRODUCTOS (ACTUALIZADO)
// ============================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const products = document.querySelectorAll('.product-card');
        let hasResults = false;
        
        products.forEach(product => {
            const nombre = product.querySelector('h3')?.textContent?.toLowerCase() || '';
            const desc = product.querySelector('.product-desc')?.textContent?.toLowerCase() || '';
            const match = nombre.includes(query) || desc.includes(query);
            
            // Verificar si el producto está visible por filtro
            const isVisible = product.style.display !== 'none';
            
            if (match && isVisible) {
                product.style.display = 'block';
                product.style.opacity = '1';
                hasResults = true;
            } else if (!match && isVisible) {
                product.style.display = 'none';
                product.style.opacity = '0';
            }
        });

        // Mostrar mensaje si no hay resultados
        const container = document.querySelector('.products-grid');
        const oldMessage = container.querySelector('.no-results-message');
        if (oldMessage) oldMessage.remove();

        if (!hasResults && query !== '') {
            const message = document.createElement('div');
            message.className = 'no-results-message';
            message.style.cssText = `
                grid-column: 1/-1;
                text-align: center;
                padding: 40px;
                color: var(--color-text-light);
            `;
            message.innerHTML = `
                <p style="font-size: 1.2rem;">🔍 No encontramos productos para "${query}"</p>
                <p style="font-size: 0.95rem; margin-top: 8px;">Prueba con otra palabra clave</p>
            `;
            container.appendChild(message);
        }
    });
}

// ============================================
// 13. FILTROS DE GALERÍA
// ============================================
function initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    if (filterButtons.length === 0) return;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            const items = document.querySelectorAll('.gallery-item');
            
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            items.forEach(item => {
                if (filter === 'all') {
                    item.style.display = 'block';
                } else {
                    const category = item.dataset.category;
                    item.style.display = category === filter ? 'block' : 'none';
                }
            });
        });
    });
}

// ============================================
// ============================================
// 13. FAQ TOGGLE (CORREGIDO)
// ============================================
function toggleFAQ(element) {
    const item = element.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const icon = element.querySelector('.faq-icon');
    const allItems = document.querySelectorAll('.faq-item');
    
    // Cerrar todos los demás
    allItems.forEach(otherItem => {
        if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            const otherIcon = otherItem.querySelector('.faq-icon');
            if (otherAnswer) {
                otherAnswer.style.maxHeight = '0';
            }
            if (otherIcon) {
                otherIcon.textContent = '+';
            }
        }
    });
    
    // Alternar el actual
    if (item.classList.contains('active')) {
        item.classList.remove('active');
        if (answer) {
            answer.style.maxHeight = '0';
        }
        if (icon) {
            icon.textContent = '+';
        }
    } else {
        item.classList.add('active');
        if (answer) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
        if (icon) {
            icon.textContent = '−';
        }
    }
}

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;

    // Abrir el primer FAQ por defecto
    if (faqItems.length > 0) {
        const firstItem = faqItems[0];
        const firstAnswer = firstItem.querySelector('.faq-answer');
        const firstIcon = firstItem.querySelector('.faq-icon');
        firstItem.classList.add('active');
        if (firstAnswer) {
            firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
        }
        if (firstIcon) {
            firstIcon.textContent = '−';
        }
    }
}

// ============================================
// FORMULARIO DE CONTACTO CON FORMPREE
// ============================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('formMessage');
        
        // Validar checkbox
        const privacidad = document.getElementById('privacidad');
        if (!privacidad || !privacidad.checked) {
            if (messageDiv) {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = '⚠️ Debes aceptar la Política de Privacidad';
                messageDiv.style.display = 'block';
            }
            return;
        }

        // Recopilar datos del formulario
        const formData = new FormData(this);
        const data = {
            nombre: formData.get('nombre'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            producto: formData.get('producto'),
            mensaje: formData.get('mensaje')
        };

        // Deshabilitar botón
        submitBtn.disabled = true;
        submitBtn.innerHTML = '⏳ Enviando...';

        try {
            // 1. ENVIAR A FORMPREE
            const formspreeResponse = await fetch('https://formspree.io/f/mjgqvjkp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const formspreeResult = await formspreeResponse.json();

            if (formspreeResult.ok) {
                // 2. GUARDAR EN LA BASE DE DATOS LOCAL
                try {
                    await fetch('/api/contacto', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nombre: data.nombre,
                            email: data.email,
                            telefono: data.telefono,
                            producto: data.producto,
                            mensaje: data.mensaje
                        })
                    });
                } catch (dbError) {
                    console.log('⚠️ No se pudo guardar en BD local, pero Formspree funcionó');
                }

                // Mostrar éxito
                if (messageDiv) {
                    messageDiv.className = 'form-message success';
                    messageDiv.textContent = '✅ ¡Mensaje enviado con éxito! Te contactaremos pronto.';
                    messageDiv.style.display = 'block';
                }
                
                this.reset();
                mostrarNotificacion('✅ ¡Mensaje enviado con éxito!');
                
            } else {
                throw new Error(formspreeResult.error || 'Error al enviar');
            }

        } catch (error) {
            console.error('Error:', error);
            
            // Intentar enviar solo a la base de datos local si falla Formspree
            try {
                const localResponse = await fetch('/api/contacto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const localResult = await localResponse.json();
                
                if (localResult.success) {
                    if (messageDiv) {
                        messageDiv.className = 'form-message success';
                        messageDiv.textContent = '✅ Mensaje guardado localmente. Te contactaremos pronto.';
                        messageDiv.style.display = 'block';
                    }
                    this.reset();
                    mostrarNotificacion('✅ Mensaje guardado localmente');
                } else {
                    throw new Error('Error al guardar localmente');
                }
            } catch (localError) {
                if (messageDiv) {
                    messageDiv.className = 'form-message error';
                    messageDiv.textContent = '❌ Error al enviar el mensaje. Por favor, intenta de nuevo.';
                    messageDiv.style.display = 'block';
                }
                mostrarNotificacion('❌ Error al enviar mensaje', 'error');
            }
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>📩 Enviar mensaje</span><span>→</span>';
        }
    });
}

// ============================================
// 15. NOTIFICACIONES
// ============================================
function mostrarNotificacion(mensaje, tipo = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${tipo}`;
    notification.textContent = mensaje;
    notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        border-radius: 12px;
        background: ${tipo === 'success' ? '#2E7D32' : '#d32f2f'};
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideUp 0.3s ease;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// 16. SCROLL SUAVE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ============================================
// 17. SCROLL TO TOP
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.querySelector('.scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
// ============================================
// ============================================
// === FUNCIONES DE REGISTRO, LOGIN Y ADMIN ===
// ============================================
// ============================================

// ============================================
// 20. REGISTRO DE USUARIOS
// ============================================
function initRegistro() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            nombre: document.getElementById('regNombre').value,
            email: document.getElementById('regEmail').value,
            telefono: document.getElementById('regTelefono').value,
            direccion: document.getElementById('regDireccion').value,
            password: document.getElementById('regPassword').value
        };

        const submitBtn = this.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('registerMessage');
        
        submitBtn.textContent = '⏳ Registrando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                messageDiv.className = 'form-message success';
                messageDiv.textContent = '✅ ¡Registro exitoso! Redirigiendo al login...';
                messageDiv.style.display = 'block';
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = '❌ ' + (result.error || 'Error al registrarse');
                messageDiv.style.display = 'block';
                submitBtn.textContent = 'Crear cuenta →';
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.className = 'form-message error';
            messageDiv.textContent = '❌ Error de conexión. Intenta de nuevo.';
            messageDiv.style.display = 'block';
            submitBtn.textContent = 'Crear cuenta →';
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// 21. LOGIN DE USUARIOS
// ============================================
function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const submitBtn = this.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('loginMessage');
        
        submitBtn.textContent = '⏳ Iniciando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                messageDiv.className = 'form-message success';
                messageDiv.textContent = '✅ ¡Bienvenido! Redirigiendo...';
                messageDiv.style.display = 'block';
                
                localStorage.setItem('usuarioGreenHome', JSON.stringify(result.usuario));
                
                if (result.usuario.esAdmin) {
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1000);
                } else {
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                }
            } else {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = '❌ ' + (result.error || 'Error al iniciar sesión');
                messageDiv.style.display = 'block';
                submitBtn.textContent = 'Iniciar Sesión →';
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.className = 'form-message error';
            messageDiv.textContent = '❌ Error de conexión. Intenta de nuevo.';
            messageDiv.style.display = 'block';
            submitBtn.textContent = 'Iniciar Sesión →';
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// 22. ADMIN - CARGAR ESTADÍSTICAS
// ============================================
async function cargarEstadisticas() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        const totalClientes = document.getElementById('totalClientes');
        const totalPedidos = document.getElementById('totalPedidos');
        const pedidosPendientes = document.getElementById('pedidosPendientes');
        const totalMensajes = document.getElementById('totalMensajes');
        
        if (totalClientes) totalClientes.textContent = stats.totalClientes || 0;
        if (totalPedidos) totalPedidos.textContent = stats.totalPedidos || 0;
        if (pedidosPendientes) pedidosPendientes.textContent = stats.pedidosPendientes || 0;
        if (totalMensajes) totalMensajes.textContent = stats.totalMensajes || 0;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ============================================
// 23. ADMIN - CARGAR PEDIDOS
// ============================================
async function cargarPedidos() {
    const tbody = document.getElementById('pedidosTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">⏳ Cargando pedidos...</td></tr>`;

    try {
        const response = await fetch('/api/pedidos');
        const pedidos = await response.json();
        
        if (pedidos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">📭 No hay pedidos aún</td></tr>`;
            return;
        }

        tbody.innerHTML = pedidos.map(pedido => `
            <tr>
                <td><strong>#${pedido.id}</strong></td>
                <td>${pedido.cliente_nombre || 'N/A'}</td>
                <td>${pedido.cliente_email || 'N/A'}</td>
                <td><strong>$${pedido.total || 0}</strong></td>
                <td>${new Date(pedido.fecha).toLocaleDateString('es-MX')}</td>
                <td>
                    <span class="status-badge status-${pedido.estatus}">
                        ${getStatusIcon(pedido.estatus)} ${pedido.estatus}
                    </span>
                </td>
                <td>
                    <button onclick="abrirModalEstatus(${pedido.id})" class="btn-small">✏️ Editar</button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: #d32f2f;">❌ Error al cargar pedidos</td></tr>`;
    }
}

// ============================================
// 24. ADMIN - CARGAR CLIENTES
// ============================================
async function cargarClientes() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    try {
        const response = await fetch('/api/clientes');
        const clientes = await response.json();
        
        container.innerHTML = `
            <div class="table-header">
                <h2>👥 Clientes Registrados</h2>
                <button onclick="cargarClientes()" class="btn-refresh">🔄 Actualizar</button>
            </div>
            <div class="table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th>Fecha Registro</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clientes.map(cliente => `
                            <tr>
                                <td>#${cliente.id}</td>
                                <td><strong>${cliente.nombre}</strong></td>
                                <td>${cliente.email}</td>
                                <td>${cliente.telefono || 'N/A'}</td>
                                <td>${cliente.direccion || 'N/A'}</td>
                                <td>${new Date(cliente.fecha_registro).toLocaleDateString('es-MX')}</td>
                                <td>${cliente.es_admin ? '👑 Admin' : '👤 Usuario'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        container.innerHTML = `<p style="text-align:center; padding:40px; color:#d32f2f;">❌ Error al cargar clientes</p>`;
    }
}

// ============================================
// 25. ADMIN - CARGAR MENSAJES
// ============================================
async function cargarMensajes() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    try {
        const response = await fetch('/api/mensajes');
        const mensajes = await response.json();
        
        container.innerHTML = `
            <div class="table-header">
                <h2>📩 Mensajes Recibidos</h2>
                <button onclick="cargarMensajes()" class="btn-refresh">🔄 Actualizar</button>
            </div>
            <div class="table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Producto</th>
                            <th>Mensaje</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mensajes.map(msg => `
                            <tr>
                                <td>#${msg.id}</td>
                                <td><strong>${msg.nombre}</strong></td>
                                <td>${msg.email}</td>
                                <td>${msg.producto_interes || 'N/A'}</td>
                                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${msg.mensaje}">
                                    ${msg.mensaje}
                                </td>
                                <td>${new Date(msg.fecha).toLocaleDateString('es-MX')}</td>
                                <td>
                                    <span class="status-badge ${msg.leido ? 'status-leido' : 'status-no-leido'}">
                                        ${msg.leido ? '✅ Leído' : '⏳ No leído'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar mensajes:', error);
        container.innerHTML = `<p style="text-align:center; padding:40px; color:#d32f2f;">❌ Error al cargar mensajes</p>`;
    }
}

// ============================================
// 26. ADMIN - ACTUALIZAR ESTATUS PEDIDO
// ============================================
function abrirModalEstatus(pedidoId) {
    document.getElementById('pedidoIdStatus').value = pedidoId;
    document.getElementById('statusModal').style.display = 'flex';
}

function cerrarModalEstatus() {
    document.getElementById('statusModal').style.display = 'none';
}

async function actualizarEstatus(event) {
    event.preventDefault();
    const pedidoId = document.getElementById('pedidoIdStatus').value;
    const nuevoEstatus = document.getElementById('nuevoEstatus').value;

    try {
        const response = await fetch(`/api/pedidos/${pedidoId}/estatus`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estatus: nuevoEstatus })
        });

        const result = await response.json();
        
        if (result.success) {
            mostrarNotificacion('✅ Estatus actualizado correctamente');
            cerrarModalEstatus();
            cargarPedidos();
            cargarEstadisticas();
        } else {
            mostrarNotificacion('❌ Error al actualizar estatus', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('❌ Error de conexión', 'error');
    }
}

// ============================================
// 27. ADMIN - CERRAR SESIÓN
// ============================================
function cerrarSesion() {
    localStorage.removeItem('usuarioGreenHome');
    window.location.href = 'login.html';
}

// ============================================
// 28. VERIFICAR SESIÓN ACTIVA
// ============================================
function verificarSesion() {
    const usuario = localStorage.getItem('usuarioGreenHome');
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (usuario) {
        try {
            const userData = JSON.parse(usuario);
            
            // Ocultar botones de login/registro
            if (authButtons) {
                authButtons.style.display = 'none';
            }
            
            // Mostrar menú de usuario
            if (userMenu) {
                userMenu.style.display = 'block';
                
                // Actualizar nombre de usuario
                const userNameDisplay = document.getElementById('userNameDisplay');
                if (userNameDisplay) {
                    userNameDisplay.textContent = userData.nombre || 'Usuario';
                }
                
                // Mostrar opción Admin si es administrador
                const adminLink = document.getElementById('adminLink');
                if (adminLink && userData.esAdmin) {
                    adminLink.style.display = 'block';
                }
            }
        } catch (e) {
            console.error('Error al verificar sesión:', e);
        }
    } else {
        // Mostrar botones de login/registro
        if (authButtons) {
            authButtons.style.display = 'flex';
        }
        
        // Ocultar menú de usuario
        if (userMenu) {
            userMenu.style.display = 'none';
        }
    }
}

// ============================================
// TOGGLE MENÚ DE USUARIO
// ============================================
function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.classList.toggle('active');
    }
}

// Cerrar menú de usuario al hacer clic fuera
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('userMenu');
    const userMenuBtn = document.querySelector('.user-menu-btn');
    
    if (userMenu && !userMenu.contains(event.target) && userMenuBtn && !userMenuBtn.contains(event.target)) {
        userMenu.classList.remove('active');
    }
});

// ============================================
// 29. UTILIDADES
// ============================================
function getStatusIcon(estatus) {
    const icons = {
        'pendiente': '⏳',
        'procesando': '🔄',
        'enviado': '📦',
        'entregado': '✅',
        'cancelado': '❌'
    };
    return icons[estatus] || '⏳';
}

// ============================================
// 30. INICIALIZAR TODAS LAS FUNCIONES
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Navbar activa
    setActiveNavLink();
    
    // Verificar sesión
    verificarSesion();
    
    // Carrito
    actualizarContadorCarrito();
    
    // Productos
    if (document.querySelector('.products-grid')) {
        cargarProductos();
    }
    
    // Registro
    if (document.getElementById('registerForm')) {
        initRegistro();
    }
    
    // Login
    if (document.getElementById('loginForm')) {
        initLogin();
    }
    
    // Admin - Dashboard
    if (document.querySelector('.admin-page')) {
        cargarEstadisticas();
        cargarPedidos();
    }
    
    // FAQ
    initFAQ();
    
    // Contacto
    initContactForm();
    
    // Búsqueda
    initSearch();
    
    // Filtros de productos
    initProductFilters();
    
    // Filtros de galería
    initGalleryFilters();
    
    console.log('🌿 Green Home - Todos los módulos cargados correctamente');
});
// ============================================
// 18. ESTILOS ADICIONALES
// ============================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: slideUp 0.3s ease;
        padding: 20px;
    }

    .modal-content {
        background: white;
        padding: 32px;
        border-radius: 16px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }

    .modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        transition: all 0.3s ease;
        padding: 4px 8px;
    }

    .modal-close:hover {
        color: #d32f2f;
        transform: rotate(90deg);
    }

    .badge-available { background: #2E7D32; }
    .badge-limited { background: #F57C00; }
    .badge-soldout { background: #d32f2f; }
    .btn-disabled {
        background: #E0E0E0;
        color: #999;
        cursor: not-allowed;
        pointer-events: none;
    }

    .cart-icon-wrapper {
        position: relative;
        margin-left: 16px;
    }

    .cart-icon-btn {
        background: var(--color-primary);
        color: white;
        border: none;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        position: relative;
        text-decoration: none;
    }

    .cart-icon-btn:hover {
        transform: scale(1.05);
        background: #1B5E20;
    }

    .cart-counter {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #d32f2f;
        color: white;
        border-radius: 50%;
        width: 22px;
        height: 22px;
        font-size: 0.7rem;
        font-weight: 700;
        display: flex !important;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', sans-serif;
        border: 2px solid white;
    }

    .active-cart {
        background: #1B5E20 !important;
        transform: scale(1.05);
    }

    .form-message {
        margin-top: 16px;
        padding: 12px;
        border-radius: 8px;
        display: none;
    }

    .form-message.success {
        display: block;
        background: #E8F5E9;
        color: #2E7D32;
        border: 1px solid #66BB6A;
    }

    .form-message.error {
        display: block;
        background: #FFEBEE;
        color: #d32f2f;
        border: 1px solid #EF5350;
    }

    .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        padding: 0 24px;
    }

    .faq-item.active .faq-answer {
        padding: 0 24px 20px;
    }
`;
document.head.appendChild(styleSheet);

// ============================================
// 19. EXPONER FUNCIONES GLOBALES
// ============================================
window.agregarAlCarrito = agregarAlCarrito;
window.quitarDelCarrito = quitarDelCarrito;
window.actualizarCantidad = actualizarCantidad;
window.procesarPedido = procesarPedido;
window.cerrarModal = cerrarModal;
window.enviarPedido = enviarPedido;
window.cargarProductos = cargarProductos;
window.mostrarNotificacion = mostrarNotificacion;
window.toggleFAQ = function(el) {
    const item = el.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const icon = el.querySelector('.faq-icon');
    
    if (item.classList.contains('active')) {
        item.classList.remove('active');
        answer.style.maxHeight = '0';
        icon.textContent = '+';
    } else {
        document.querySelectorAll('.faq-item.active').forEach(el => {
            if (el !== item) {
                el.classList.remove('active');
                el.querySelector('.faq-answer').style.maxHeight = '0';
                el.querySelector('.faq-icon').textContent = '+';
            }
        });
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.textContent = '−';
    }
};
// ============================================
// 35. FUNCIONES DE PAGO
// ============================================

// Variable global para el total del carrito
let totalCarrito = 0;

// Mostrar modal de pago
function mostrarModalPago() {
    const usuario = localStorage.getItem('usuarioGreenHome');
    
    if (!usuario) {
        mostrarNotificacion('⚠️ Debes iniciar sesión para realizar el pago', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    try {
        const userData = JSON.parse(usuario);
        
        // Verificar que el carrito no esté vacío
        if (carrito.length === 0) {
            mostrarNotificacion('⚠️ El carrito está vacío', 'error');
            return;
        }

        // Calcular total
        totalCarrito = obtenerTotalCarrito();
        const envio = totalCarrito >= 500 ? 0 : 80;
        const totalFinal = totalCarrito + envio;

        // Autocompletar datos del usuario
        document.getElementById('pagoNombre').value = userData.nombre || '';
        document.getElementById('pagoEmail').value = userData.email || '';
        document.getElementById('pagoDireccion').value = userData.direccion || '';

        // Mostrar resumen del pedido
        const summary = document.getElementById('paymentSummary');
        summary.innerHTML = `
            <div class="payment-summary-row">
                <span>Productos (${carrito.length})</span>
                <span>$${totalCarrito.toFixed(2)}</span>
            </div>
            <div class="payment-summary-row">
                <span>Envío</span>
                <span>${envio === 0 ? 'Gratis' : '$' + envio.toFixed(2)}</span>
            </div>
            <div class="payment-summary-row total">
                <span><strong>Total</strong></span>
                <span><strong>$${totalFinal.toFixed(2)} MXN</strong></span>
            </div>
            <div class="payment-summary-items">
                ${carrito.map(item => `
                    <div class="payment-item">
                        <span>${item.cantidad}x ${item.nombre}</span>
                        <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Actualizar botón de pago
        document.getElementById('payAmount').textContent = `$${totalFinal.toFixed(2)} MXN`;

        // Mostrar modal
        document.getElementById('paymentModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error al mostrar modal de pago:', error);
        mostrarNotificacion('❌ Error al procesar el pago', 'error');
    }
}

// Cerrar modal de pago
function cerrarModalPago() {
    document.getElementById('paymentModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Formatear número de tarjeta
function formatearTarjeta(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    input.value = value.substring(0, 19);
    detectarTipoTarjeta(value);
}

// Detectar tipo de tarjeta
function detectarTipoTarjeta(numero) {
    const clean = numero.replace(/\s/g, '');
    const typeElement = document.getElementById('cardType');
    
    if (clean.startsWith('4')) {
        typeElement.textContent = 'Visa 💳';
        typeElement.style.color = '#1a1f71';
    } else if (clean.startsWith('5')) {
        typeElement.textContent = 'Mastercard 💳';
        typeElement.style.color = '#eb001b';
    } else if (clean.startsWith('3')) {
        typeElement.textContent = 'American Express 💳';
        typeElement.style.color = '#1a1f71';
    } else if (clean.startsWith('6')) {
        typeElement.textContent = 'Discover 💳';
        typeElement.style.color = '#f68b1e';
    } else {
        typeElement.textContent = 'Tarjeta 💳';
        typeElement.style.color = '#666';
    }
}

// Formatear fecha de expiración
function formatearFecha(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value.substring(0, 5);
}

// Procesar pago
async function procesarPago(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('.btn-pay');
    const messageDiv = document.getElementById('paymentMessage');
    
    // Validar tarjeta
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;
    const cardName = document.getElementById('cardName').value;

    // Validaciones simples de tarjeta
    if (cardNumber.length < 16) {
        mostrarNotificacion('⚠️ Número de tarjeta inválido', 'error');
        return;
    }

    if (!cardExpiry || cardExpiry.length < 5) {
        mostrarNotificacion('⚠️ Fecha de expiración inválida', 'error');
        return;
    }

    if (cardCvv.length < 3) {
        mostrarNotificacion('⚠️ CVV inválido', 'error');
        return;
    }

    if (!cardName || cardName.length < 3) {
        mostrarNotificacion('⚠️ Nombre en la tarjeta requerido', 'error');
        return;
    }

    // Obtener usuario
    const usuario = JSON.parse(localStorage.getItem('usuarioGreenHome'));
    
    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Procesando pago...';

    try {
        // Calcular total
        const total = obtenerTotalCarrito();
        const envio = total >= 500 ? 0 : 80;
        const totalFinal = total + envio;

        // Preparar items del pedido
        const items = carrito.map(item => ({
            producto_id: parseInt(item.id),
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad
        }));

        // Crear pedido en la base de datos
        const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clienteId: usuario.id,
                items: items,
                total: totalFinal,
                direccion: usuario.direccion
            })
        });

        const result = await response.json();

        if (result.success) {
            // Guardar información del pedido en localStorage para confirmación
            const pedidoInfo = {
                id: result.pedidoId,
                fecha: new Date().toISOString(),
                total: totalFinal,
                items: carrito.map(item => ({
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precio: item.precio
                })),
                direccion: usuario.direccion
            };
            localStorage.setItem('ultimoPedido', JSON.stringify(pedidoInfo));

            // Limpiar carrito
            carrito = [];
            localStorage.setItem('carritoGreenHome', JSON.stringify(carrito));
            actualizarContadorCarrito();

            // Cerrar modal de pago
            cerrarModalPago();

            // Mostrar confirmación
            mostrarConfirmacion(pedidoInfo);
            
            // Actualizar vista del carrito
            actualizarVistaCarrito();

        } else {
            throw new Error(result.error || 'Error al crear pedido');
        }

    } catch (error) {
        console.error('Error en pago:', error);
        mostrarNotificacion('❌ Error al procesar el pago: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>💰 Pagar</span><span class="pay-amount" id="payAmount">$' + totalFinal.toFixed(2) + ' MXN</span>';
    }
}

// Mostrar confirmación de pago
function mostrarConfirmacion(pedidoInfo) {
    const modal = document.getElementById('confirmModal');
    const details = document.getElementById('confirmDetails');
    
    details.innerHTML = `
        <div class="confirm-row">
            <span>Número de pedido:</span>
            <strong>#${pedidoInfo.id}</strong>
        </div>
        <div class="confirm-row">
            <span>Total pagado:</span>
            <strong>$${pedidoInfo.total.toFixed(2)} MXN</strong>
        </div>
        <div class="confirm-row">
            <span>Fecha:</span>
            <strong>${new Date(pedidoInfo.fecha).toLocaleDateString('es-MX')}</strong>
        </div>
        <div class="confirm-row">
            <span>Dirección de envío:</span>
            <strong>${pedidoInfo.direccion}</strong>
        </div>
        <div class="confirm-items">
            <h4>Productos:</h4>
            ${pedidoInfo.items.map(item => `
                <div class="confirm-item">
                    <span>${item.cantidad}x ${item.nombre}</span>
                    <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    mostrarNotificacion('🎉 ¡Pago realizado con éxito!');
}

// Cerrar modal de confirmación
function cerrarConfirmacion() {
    document.getElementById('confirmModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}