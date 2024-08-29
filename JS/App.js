document.addEventListener('DOMContentLoaded', () => {
    // Asignar eventos a los botones de productos estáticos
    assignBuyButtonEvents();
    assignStaticBuyButtonEvents();
    assignOfferBuyButtonEvents(); // Nueva función para los botones de oferta

    // Cargar productos dinámicamente
    loadDynamicProducts();

    checkSession();
    updateCart();
});

// Función para cargar productos dinámicos y asignar eventos
function loadDynamicProducts() {
    // Cargar productos, productos más vendidos y productos en oferta
    Promise.all([
        fetch('/get-products').then(response => response.json()),
        fetch('/get-best-selling-products').then(response => response.json()),
        fetch('/get-discounted-products').then(response => response.json())
    ])
    .then(([productosData, bestSellingData, discountedData]) => {
        const productos = productosData.products;
        const bestSellingProducts = bestSellingData.products;
        const discountedProducts = discountedData.products;

        const contenedorProductos = document.querySelector('.divSeccionProductos');
        const contenedorProductosMasVendidos = document.querySelector('.contenedorProductosMasVendidos');
        const divSeccionProductosOferta = document.querySelector('.divSeccionProductosOferta');

        // Cargar productos más vendidos
        if (contenedorProductosMasVendidos) {
            bestSellingProducts.forEach(producto => {
                const price = producto.price ? parseFloat(producto.price) : 0;
                const imageUrl = producto.image_url || '/path/to/default/image.jpg';
                const productHTML = `
                    <div class="productoCartas">
                        <img src="${imageUrl}" alt="${producto.product_name}" class="imagen">
                        <div class="p-4">
                            <h3 class="tituloOrdenador">${producto.product_name}</h3>
                            <p class="descripcionRapida">${producto.description}</p>
                            <p class="descripcionComponentes"><strong>Componentes:</strong> ${producto.components}</p>
                            <div class="divBtn">
                                <span class="precio">$${producto.price}</span>
                                <button class="btnComprar" data-product="${producto.product_name}" data-price="${producto.price}">Comprar</button>
                            </div>
                        </div>
                    </div>
                `;
                contenedorProductosMasVendidos.insertAdjacentHTML('beforeend', productHTML);
            });
        }

        // Cargar productos en oferta
        if (divSeccionProductosOferta) {
            discountedProducts.forEach(producto => {
                const precioAntes = producto.ofert_price ? parseFloat(producto.ofert_price).toFixed(2) : '0.00';
                const precioAhora = producto.ofert_price_now ? parseFloat(producto.ofert_price_now).toFixed(2) : '0.00';
                const imageUrl = producto.ofert_image_url || '/path/to/default/image.jpg';
                const productHTML = `
                    <div class="productoCartasOferta">
                        <img src="${imageUrl}" alt="${producto.ofert_product_name}" class="imagenOferta">
                        <div class="p-4">
                            <h3 class="tituloOrdenadorOferta">${producto.ofert_product_name}</h3>
                            <p class="descripcionRapidaOferta">${producto.ofert_description}</p>
                            <p class="descripcionComponentesOferta"><strong>Componentes:</strong> ${producto.ofert_components}</p>
                            <div class="divBtnOferta">
                                <span class="precioOfertaAntes">Antes: $${precioAntes}</span>
                                <span class="precioOfertaDespues" id="precioOferta">Ahora: $${precioAhora}</span>
                                <button class="btnComprarOferta" data-product="${producto.ofert_product_name}" data-price="${precioAhora}">Comprar</button>
                            </div>
                        </div>
                    </div>
                `;
                divSeccionProductosOferta.insertAdjacentHTML('beforeend', productHTML);
            });
        }

        // Cargar productos generales
        if (contenedorProductos) {
            productos.forEach(producto => {
                const imageUrl = producto.image_url || '/path/to/default/image.jpg';
                contenedorProductos.insertAdjacentHTML('beforeend', `
                    <div class="productoCartas">
                        <img src="${imageUrl}" alt="${producto.product_name}" class="imagen">
                        <div class="p-4">
                            <h3 class="tituloOrdenador">${producto.product_name}</h3>
                            <p class="descripcionRapida">${producto.description}</p>
                            <p class="descripcionComponentes"><strong>Componentes:</strong> ${producto.components}</p>
                            <div class="divBtn">
                                <span class="precio">$${producto.price}</span>
                                <button class="btnComprar" data-product="${producto.product_name}" data-price="${producto.price}">Comprar</button>
                            </div>
                        </div>
                    </div>
                `);
            });
        }

        // Asignar eventos de clic después de cargar todos los productos dinámicos
        assignBuyButtonEvents();
        assignOfferBuyButtonEvents(); // Asignar eventos a los nuevos botones de oferta
    })
    .catch(error => {
        console.error('Error al cargar los productos:', error);
    });
}

// Función para asignar eventos a los botones "Comprar" de productos dinámicos
function assignBuyButtonEvents() {
    const buyButtons = document.querySelectorAll('.btnComprar');
    console.log('Buy buttons found:', buyButtons); // Verifica cuántos botones se encuentran
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = button.getAttribute('data-product');
            const price = parseFloat(button.getAttribute('data-price'));
            console.log(`Producto: ${product}, Precio: ${price}`); // Verifica que los datos se están obteniendo correctamente
            addToCart(product, price);
        });
    });
}

// Nueva función para asignar eventos a los botones "Comprar" de productos en oferta
function assignOfferBuyButtonEvents() {
    const offerBuyButtons = document.querySelectorAll('.btnComprarOferta');
    console.log('Offer buy buttons found:', offerBuyButtons); // Verifica cuántos botones de oferta se encuentran
    offerBuyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = button.getAttribute('data-product');
            const price = parseFloat(button.getAttribute('data-price'));
            console.log(`Producto en oferta: ${product}, Precio: ${price}`); // Verifica que los datos se están obteniendo correctamente
            addToCart(product, price);
        });
    });
}

// Función para asignar eventos a los botones "Comprar" de productos estáticos
function assignStaticBuyButtonEvents() {
    const staticBuyButtons = document.querySelectorAll('.btnComprarMasVendido');
    console.log('Static buy buttons found:', staticBuyButtons); // Verifica cuántos botones estáticos se encuentran
    staticBuyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = button.getAttribute('data-product');
            const price = parseFloat(button.getAttribute('data-price'));
            console.log(`Producto estático: ${product}, Precio: ${price}`); // Verifica que los datos se están obteniendo correctamente
            addToCart(product, price);
        });
    });
}

// Carrito de compras
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para agregar un producto al carrito
function addToCart(product, price) {
    console.log(`Añadiendo al carrito: ${product} - ${price}`);
    const existingProduct = cart.find(item => item.product === product);

    if (existingProduct) {
        existingProduct.quantity += 1;
        console.log(`Producto existente. Nueva cantidad: ${existingProduct.quantity}`);
    } else {
        cart.push({ product, price, quantity: 1 });
        console.log(`Producto añadido. Carrito ahora tiene: ${cart.length} productos`);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    saveCart();
    updateCart();
    showNotification(`${product} ha sido agregado al carrito.`);
}

// Función para actualizar el carrito
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cartItems) {
        cartItems.innerHTML = ''; // Limpiar el contenedor antes de agregar los nuevos elementos
        let total = 0;
        cart.forEach(item => {
            const li = document.createElement('div');
            li.className = 'cartaCarrito';
            li.innerHTML = `
                <div>
                    <h3 class="tituloOrdenador">${item.product}</h3>
                    <p class="descripcionRapida">Cantidad: ${item.quantity}</p>
                    <p class="precio">$${item.price.toFixed(2)}</p>
                </div>
                <button class="btnEliminar" onclick="removeFromCart('${item.product}')">Eliminar</button>
            `;
            cartItems.appendChild(li);
            total += item.price * item.quantity;
        });
        cartTotal.innerText = total.toFixed(2);
    }

    if (cartCount) {
        cartCount.innerText = cart.length;
        cartCount.classList.remove('hidden');
    }
}

// Función para eliminar un producto del carrito
function removeFromCart(product) {
    cart = cart.filter(item => item.product !== product);
    saveCart();
    updateCart();
}

// Función para guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para verificar la sesión del usuario
function checkSession() {
    fetch('/session')
        .then(response => response.json())
        .then(data => {
            if (data.sessionActive) {
                updateNavForLoggedInUser(data.user);
            }
        })
        .catch(error => {
            console.error('Error al verificar la sesión:', error);
        });
}

// Función para actualizar la barra de navegación según el estado de sesión del usuario
function updateNavForLoggedInUser(user) {
    const loginNav = document.getElementById('loginNav');
    const registerNav = document.getElementById('registerNav');
    const userNav = document.getElementById('userNav');
    const logoutNav = document.getElementById('logoutNav');
    const productosNav = document.querySelector('.navBarMenuItem[href="/HTML/productos.html"]');
    const contactoNav = document.querySelector('.navBarMenuItem[href="/HTML/contanto.html"]');

    if (user) {
        loginNav.classList.add('hidden');
        registerNav.classList.add('hidden');
        userNav.classList.remove('hidden');
        userNav.innerText = user.name;
        logoutNav.classList.remove('hidden');

        if (user.isAdmin) {
            if (productosNav) {
                productosNav.innerText = 'Administrar Productos';
                productosNav.href = '/HTML/adminProductos.html';
            }
            if (contactoNav) {
                contactoNav.innerText = 'Solicitudes de Contacto';
                contactoNav.href = '/HTML/solicitudContacto.html';
            }
        } else {
            if (productosNav) {
                productosNav.innerText = 'Productos';
                productosNav.href = '/HTML/productos.html';
            }
            if (contactoNav) {
                contactoNav.innerText = 'Contacto';
                contactoNav.href = '/HTML/contanto.html';
            }
        }
    }
}

// Función para cerrar la sesión del usuario
function logoutUser() {
    fetch('/logout', { method: 'POST' })
        .then(response => {
            if (response.ok) {
                window.location.href = '/HTML/login.html';
            }
        })
        .catch(error => {
            console.error('Error al cerrar la sesión:', error);
        });
}

// Función para verificar la sesión y generar una factura
function checkSessionAndGenerateInvoice() {
    fetch('/session')
        .then(response => response.json())
        .then(data => {
            if (!data.sessionActive) {
                window.location.href = '/HTML/login.html';
            } else if (cart.length === 0) {
                showNotification('El carrito está vacío. Agrega productos antes de finalizar la compra.', 'error');
            } else {
                generateInvoice(data.user);  // Pasar los datos del usuario a la función
            }
        })
        .catch(error => {
            console.error('Error al verificar la sesión:', error);
        });
}

// Función para generar la factura de la compra
function generateInvoice(user) {
    if (!user || cart.length === 0) {
        console.error('Condiciones no cumplidas para generar la factura.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name = user.name;
    const email = user.email;
    const cedula = user.cedula;

    doc.setFont('times');
    doc.setFontSize(18);
    doc.text(20, 20, 'Factura de Compra');
    
    doc.setFontSize(12);
    doc.text(20, 30, `Nombre: ${name}`);
    doc.text(20, 40, `Correo Electrónico: ${email}`);
    doc.text(20, 50, `Cédula: ${cedula}`);

    let y = 60;
    let total = 0;
    cart.forEach(item => {
        doc.text(20, y, `${item.product} - Cantidad: ${item.quantity} - Precio: $${item.price.toFixed(2)}`);
        y += 10;
        total += item.price * item.quantity;
    });

    doc.setFontSize(14);
    doc.text(20, y, `Total: $${total.toFixed(2)}`);

    cart = [];
    saveCart();
    updateCart();

    doc.save('FacturaCompra.pdf');
    showNotification('Factura generada y guardada.');
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    notification.innerText = message;
    document.body.appendChild(notification);

    // Mostrar la notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Ocultar la notificación después de 7 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 7000);
}