document.addEventListener('DOMContentLoaded', () => {
    const addDiscountedProductButton = document.getElementById('addDiscountedProductButton');
    const closeDiscountedModalButton = document.getElementById('closeDiscountedModalButton');
    const addDiscountedProductModal = document.getElementById('addDiscountedProductModal');
    const modalContent = document.querySelector('#addDiscountedProductModal .modal-content');
    const discountedImageURLInput = document.getElementById('discountedImageURL');
    const discountedPreviewImg = document.getElementById('discountedPreviewImg');
    const addDiscountedProductForm = document.getElementById('addDiscountedProductForm');

    // Abrir el modal
    if (addDiscountedProductButton && addDiscountedProductModal) {
        addDiscountedProductButton.addEventListener('click', () => {
            addDiscountedProductModal.classList.remove('hidden');
            addDiscountedProductModal.classList.add('show');
        });
    } else {
        console.error("addDiscountedProductButton or addDiscountedProductModal is null");
    }

    // Cerrar el modal al hacer clic en el botón de cerrar
    if (closeDiscountedModalButton && addDiscountedProductModal) {
        closeDiscountedModalButton.addEventListener('click', () => {
            addDiscountedProductModal.classList.remove('show');
            addDiscountedProductModal.classList.add('hidden');
        });
    } else {
        console.error("closeDiscountedModalButton or addDiscountedProductModal is null");
    }

    // Cerrar el modal al hacer clic fuera del contenido
    if (addDiscountedProductModal) {
        addDiscountedProductModal.addEventListener('click', (event) => {
            if (event.target === addDiscountedProductModal) {
                addDiscountedProductModal.classList.remove('show');
                addDiscountedProductModal.classList.add('hidden');
            }
        });
    } else {
        console.error("addDiscountedProductModal is null");
    }

    // Detener la propagación del evento de clic dentro del modalContent para evitar que se cierre el modal
    if (modalContent) {
        modalContent.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    } else {
        console.error("modalContent is null");
    }

    // Mostrar vista previa de la imagen basada en la URL y convertir el enlace de Dropbox
    if (discountedImageURLInput) {
        discountedImageURLInput.addEventListener('input', () => {
            const imageUrl = discountedImageURLInput.value.trim();
            const convertedUrl = convertDropboxLink(imageUrl);
            discountedImageURLInput.value = convertedUrl; // Actualizar el campo con la URL modificada
            if (convertedUrl && discountedPreviewImg) {
                discountedPreviewImg.src = convertedUrl;
                discountedPreviewImg.classList.remove('hidden');
            } else if (discountedPreviewImg) {
                discountedPreviewImg.src = "";
                discountedPreviewImg.classList.add('hidden');
            }
        });
    } else {
        console.error("discountedImageURLInput or discountedPreviewImg is null");
    }

    // Función para convertir un enlace de Dropbox a enlace directo
    function convertDropboxLink(url) {
        if (url.includes("dropbox.com")) {
            return url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "");
        }
        return url;
    }

    // Manejo del envío del formulario para agregar un producto en oferta
    if (addDiscountedProductForm) {
        addDiscountedProductForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevenir el envío del formulario de forma predeterminada

            // Obtener los datos del formulario
            const formData = new FormData(addDiscountedProductForm);

            // Convertir FormData a un objeto JSON
            const data = {
                product_name: formData.get('product_name'),
                description: formData.get('description'),
                components: formData.get('components'),
                price_before: formData.get('price_before'),
                price_now: formData.get('price_now'),
                stock: formData.get('stock'),
                image_url: formData.get('image_url')
            };

            try {
                // Realizar la solicitud POST al servidor
                const response = await fetch('/add-discounted-product', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    // Mostrar notificación de éxito
                    showNotification('Producto agregado correctamente', 'success');
                    window.location.href = '/HTML/productos.html';
                } else {
                    const errorData = await response.json();
                    // Mostrar notificación de error
                    showNotification('Error al agregar el producto: ' + errorData.message, 'error');
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                showNotification('Ocurrió un error al intentar agregar el producto.', 'error');
            }
        });
    } else {
        console.error("addDiscountedProductForm is null");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const openDeleteModalButton = document.getElementById('removeDiscountedProductButton');
    const deleteProductModal = document.getElementById('deleteDiscountedProductModal');
    const productListContainer = document.getElementById('discountedProductList');
    const closeDeleteModalButton = document.getElementById('closeDeleteDiscountedModalButton');

    if (openDeleteModalButton) {
        openDeleteModalButton.addEventListener('click', () => {
            fetch('/get-discounted-products')
                .then(response => response.json())
                .then(data => {
                    const products = data.products;
                    productListContainer.innerHTML = ''; // Limpiar contenedor

                    products.forEach(product => {
                        productListContainer.insertAdjacentHTML('beforeend', `
                            <div class="productoEliminar">
                                <span> ${product.ofert_product_name}</span>
                                <button class="adminCardButton delete" onclick="deleteProduct(${product.ofert_product_id})">Eliminar</button>
                            </div>
                        `);
                    });

                    deleteProductModal.classList.remove('hidden');
                    deleteProductModal.classList.add('show');
                })
                .catch(error => {
                    console.error('Error al obtener los productos en oferta:', error);
                    showNotification('Error al obtener los productos en oferta', 'error');
                });
        });
    }

    if (closeDeleteModalButton) {
        closeDeleteModalButton.addEventListener('click', () => {
            closeModal(deleteProductModal);
        });
    }

    // Cerrar el modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === deleteProductModal) {
            closeModal(deleteProductModal);
        }
    });
});

function deleteProduct(productId) {
    fetch(`/delete-product/${productId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error al eliminar el producto:', data.error);
            showNotification('Error al eliminar el producto', 'error');
        } else {
            console.log('Producto eliminado correctamente:', data.message);
            showNotification('Producto eliminado correctamente', 'success');
            // Aquí puedes actualizar la lista de productos eliminando el elemento correspondiente
            const productElement = document.querySelector(`button[onclick="deleteProduct(${productId})"]`).parentElement;
            productElement.remove();
        }
    })
    .catch(error => {
        console.error('Error en la solicitud de eliminación:', error);
        showNotification('Ocurrió un error al intentar eliminar el producto.', 'error');
    });
}

function closeModal(modal) {
    modal.classList.remove('show');
    modal.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const listDiscountedProductsButton = document.getElementById('listDiscountedProductsButton');
    const listDiscountedProductsModal = document.getElementById('listDiscountedProductsModal');
    const closeListDiscountedModalButton = document.getElementById('closeListDiscountedModalButton');
    const discountedProductListContainer = document.getElementById('discountedProductListContainer');
    const modalContent = document.querySelector('#listDiscountedProductsModal .modal-content');

    // Función para abrir el modal de listado
    if (listDiscountedProductsButton) {
        listDiscountedProductsButton.addEventListener('click', async () => {
            if (listDiscountedProductsModal.classList) {
                listDiscountedProductsModal.classList.remove('hidden');
                listDiscountedProductsModal.classList.add('show');

                // Realizar la solicitud para obtener los productos
                try {
                    const response = await fetch('/get-discounted-products');
                    const data = await response.json();

                    // Limpiar el contenedor antes de agregar nuevos elementos
                    discountedProductListContainer.innerHTML = '';

                    // Verificar si hay productos
                    if (data.products && data.products.length > 0) {
                        data.products.forEach(product => {
                            discountedProductListContainer.insertAdjacentHTML('beforeend', `
                                <div class="productoEliminar">
                                    <div>
                                        <span><strong>ID:</strong> ${product.ofert_product_id}</span>
                                        <span><strong>Nombre:</strong> ${product.ofert_product_name}</span>
                                    </div>
                                    <div>
                                        <span><strong>Descripción:</strong> ${product.ofert_description}</span>
                                    </div>
                                    <div>
                                        <span class="precio"><strong>Precio Antes:</strong> $${product.ofert_price}</span>
                                        <span class="precio"><strong>Precio Ahora:</strong> $${product.ofert_price_now}</span>
                                    </div>
                                    <div>
                                        <span><strong>Stock:</strong> ${product.ofert_stock}</span>
                                    </div>
                                    <div>
                                        <span><strong>Componentes:</strong> ${product.ofert_components}</span>
                                    </div>
                                </div>
                            `);
                        });
                    } else {
                        discountedProductListContainer.innerHTML = '<p>No se encontraron productos en oferta.</p>';
                    }
                } catch (error) {
                    console.error('Error al obtener los productos en oferta:', error);
                    showNotification('Error al obtener los productos en oferta.', 'error');
                    discountedProductListContainer.innerHTML = '<p>Error al cargar los productos.</p>';
                }
            }
        });
    } else {
        console.error("listDiscountedProductsButton or listDiscountedProductsModal is null");
    }

    // Cerrar el modal al hacer clic en el botón de cerrar
    if (closeListDiscountedModalButton && listDiscountedProductsModal) {
        closeListDiscountedModalButton.addEventListener('click', () => {
            if (listDiscountedProductsModal.classList) {
                listDiscountedProductsModal.classList.remove('show');
                listDiscountedProductsModal.classList.add('hidden');
            }
        });
    } else {
        console.error("closeListDiscountedModalButton or listDiscountedProductsModal is null");
    }

    // Cerrar el modal al hacer clic fuera del contenido
    if (listDiscountedProductsModal) {
        listDiscountedProductsModal.addEventListener('click', (event) => {
            if (event.target === listDiscountedProductsModal) {
                listDiscountedProductsModal.classList.remove('show');
                listDiscountedProductsModal.classList.add('hidden');
            }
        });
    } else {
        console.error("listDiscountedProductsModal is null");
    }

    // Detener la propagación del evento de clic dentro del modalContent para evitar que se cierre el modal al hacer clic en el contenido
    if (modalContent) {
        modalContent.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    } else {
        console.error("modalContent is null");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const viewProductsButton = document.getElementById('viewDiscountedProductsButton');

    if (viewProductsButton) {
        viewProductsButton.addEventListener('click', () => {
            window.location.href = '/HTML/index.html';
        });
    } else {
        console.error("viewDiscountedProductsButton no encontrado");
    }
});

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    // Mostrar la notificación
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Ocultar la notificación después de 6 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => {
            notification.remove();
        });
    }, 6000);
}