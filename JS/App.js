document.addEventListener('DOMContentLoaded', () => {
    fetch('/get-products')
        .then(response => response.json())
        .then(data => {
            const productos = data.products;
            const contenedorProductos = document.querySelector('.divSeccionProductos');
            const contenedorProductosMasVendidos = document.querySelector('.contenedorProductosMasVendidos');
            const divSeccionProductosOferta = document.querySelector('.divSeccionProductosOferta');

            if (contenedorProductosMasVendidos) {
                // Realizar la carga dinámica de la tabla "best_selling_products"
                fetch('/get-best-selling-products')
                    .then(response => response.json())
                    .then(data => {
                        const productos = data.products;
        
                        productos.forEach(producto => {
                            // Convertir price a número, manejar null o undefined
                            const price = producto.price ? parseFloat(producto.price) : 0;
                            const imageUrl = producto.image_url || '/path/to/default/image.jpg'; // Proveer una URL por defecto si no hay imagen
        
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
                    })
                    .catch(error => {
                        console.error('Error al obtener los productos más vendidos:', error);
                    });
            } else {
                console.log('El contenedor de productos más vendidos no se encuentra en el HTML.');
            }

            //Carga dinamica de productos en oferta
            if (divSeccionProductosOferta) {
                // Realizar la carga dinámica de la tabla "ofert_products"
                fetch('/get-discounted-products')
                    .then(response => response.json())
                    .then(data => {
                        const productos = data.products;
        
                        productos.forEach(producto => {
                            // Convertir los precios a números y manejar null o undefined
                            const precioAntes = producto.ofert_price ? parseFloat(producto.ofert_price).toFixed(2) : '0.00';
                            const precioAhora = producto.ofert_price_now ? parseFloat(producto.ofert_price_now).toFixed(2) : '0.00';
                            const imageUrl = producto.ofert_image_url || '/path/to/default/image.jpg'; // URL por defecto si no hay imagen
        
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
                    })
                    .catch(error => {
                        console.error('Error al obtener los productos en oferta:', error);
                    });
            } else {
                console.log('El contenedor de productos en oferta no se encuentra en el HTML.');
            }
            
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

                const buyButtons = document.querySelectorAll('.btnComprar');
                buyButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const product = button.getAttribute('data-product');
                        const price = parseFloat(button.getAttribute('data-price'));
                        addToCart(product, price);
                    });
                });

            } else {
                console.log('No se encontró el contenedor para los productos.');
            }
        })
        .catch(error => {
            console.error('Error al obtener los productos:', error);
        });

    checkSession();
    updateCart();

    // Manejador para el botón de finalizar compra
    const finalizeButton = document.querySelector('.cartButton');
    if (finalizeButton) {
        finalizeButton.addEventListener('click', (event) => {
            event.preventDefault();
            checkSessionAndGenerateInvoice();
        });
    }

    // Manejador para el botón de cerrar sesión
    const logoutNav = document.getElementById('logoutNav');
    if (logoutNav) {
        logoutNav.addEventListener('click', (event) => {
            event.preventDefault();
            logoutUser();
        });
    }
});

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(product, price) {
    const existingProduct = cart.find(item => item.product === product);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ product, price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    saveCart();
    updateCart();
    showNotification(`${product} ha sido agregado al carrito.`);
}

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

function removeFromCart(product) {
    cart = cart.filter(item => item.product !== product);
    saveCart();
    updateCart();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

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

