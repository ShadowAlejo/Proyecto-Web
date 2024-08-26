document.addEventListener('DOMContentLoaded', () => {
    const openModalButton = document.getElementById('openModalButton');
    const closeModalButton = document.getElementById('closeModalButton');
    const addProductModal = document.getElementById('addProductModal');
    const modalContent = document.querySelector('.modal-content');
    const imageURLInput = document.getElementById('imageURL');
    const previewImg = document.getElementById('previewImg');
    const addProductForm = document.getElementById('addProductForm');

    // Abrir el modal
    if (openModalButton && addProductModal) {
        openModalButton.addEventListener('click', () => {
            if (addProductModal.classList) {
                addProductModal.classList.remove('hidden');
                addProductModal.classList.add('show');
            }
        });
    } else {
        console.error("openModalButton or addProductModal is null");
    }

    // Cerrar el modal al hacer clic en el botón de cerrar
    if (closeModalButton && addProductModal) {
        closeModalButton.addEventListener('click', () => {
            if (addProductModal.classList) {
                addProductModal.classList.remove('show');
                addProductModal.classList.add('hidden');
            }
        });
    } else {
        console.error("closeModalButton or addProductModal is null");
    }

    // Cerrar el modal al hacer clic fuera del contenido
    if (addProductModal) {
        addProductModal.addEventListener('click', (event) => {
            if (!modalContent.contains(event.target)) {
                addProductModal.classList.remove('show');
                addProductModal.classList.add('hidden');
            }
        });
    } else {
        console.error("addProductModal is null");
    }

    // Mostrar vista previa de la imagen basada en la URL y convertir el enlace de Dropbox
    if (imageURLInput) {
        imageURLInput.addEventListener('input', () => {
            const imageUrl = imageURLInput.value.trim();
            const convertedUrl = convertDropboxLink(imageUrl);
            imageURLInput.value = convertedUrl; // Actualizar el campo con la URL modificada
            if (convertedUrl && previewImg) {
                previewImg.src = convertedUrl;
                previewImg.classList.remove('hidden');
            } else if (previewImg) {
                previewImg.src = "";
                previewImg.classList.add('hidden');
            }
        });
    } else {
        console.error("imageURLInput or previewImg is null");
    }

    // Función para convertir un enlace de Dropbox a enlace directo
    function convertDropboxLink(url) {
        if (url.includes("dropbox.com")) {
            return url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "");
        }
        return url;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Modal para Eliminar Producto
    const openDeleteModalButton = document.getElementById('openDeleteModalButton');
    const closeDeleteModalButton = document.getElementById('closeDeleteModalButton');
    const deleteProductModal = document.getElementById('deleteProductModal');
    const deleteModalContent = deleteProductModal.querySelector('.modal-content');
    const productList = document.getElementById('productList');

    // Abrir el modal de eliminar productos
    if (openDeleteModalButton && deleteProductModal) {
        openDeleteModalButton.addEventListener('click', () => {
            deleteProductModal.classList.remove('hidden');
            deleteProductModal.classList.add('show');
            loadProductsForDeletion();
        });
    }

    // Cerrar el modal de eliminar productos
    if (closeDeleteModalButton && deleteProductModal) {
        closeDeleteModalButton.addEventListener('click', () => {
            deleteProductModal.classList.remove('show');
            deleteProductModal.classList.add('hidden');
        });
    }

    // Cerrar el modal de eliminar productos al hacer clic fuera del contenido
    if (deleteProductModal) {
        deleteProductModal.addEventListener('click', (event) => {
            if (!deleteModalContent.contains(event.target)) {
                deleteProductModal.classList.remove('show');
                deleteProductModal.classList.add('hidden');
            }
        });
    }

    // Función para cargar productos en el modal de eliminación
    function loadProductsForDeletion() {
        fetch('/get-products')
            .then(response => response.json())
            .then(data => {
                productList.innerHTML = ''; // Limpiar la lista de productos
                data.products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.className = 'productoEliminar flex justify-between items-center';
                    productItem.innerHTML = `
                        <span>${product.product_name}</span>
                        <button class="adminCardButton btnEliminar" data-product-id="${product.product_id}">Eliminar</button>
                    `;
                    productList.appendChild(productItem);
                });

                // Asignar eventos de clic a los botones de eliminación
                const deleteButtons = document.querySelectorAll('.btnEliminar');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', (event) => {
                        const productId = event.target.getAttribute('data-product-id');
                        deleteProduct(productId);
                    });
                });
            })
            .catch(error => {
                console.error('Error al cargar los productos para eliminación:', error);
            });
    }

    // Función para eliminar un producto de la base de datos
    function deleteProduct(productId) {
        fetch(`/delete-product/${productId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al eliminar el producto: ${response.statusText}`);
            }
            return response.json(); // Asegúrate de que la respuesta sea JSON
        })
        .then(data => {
            if (data.success) {
                showNotification('Producto eliminado correctamente.');
                loadProductsForDeletion(); // Recargar la lista de productos
            } else {
                showNotification('Error al eliminar el producto.', 'error');
            }
        })
        .catch(error => {
            console.error('Error al eliminar el producto:', error);
            showNotification('Error al eliminar el producto.', 'error');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const openListModalButton = document.getElementById('openListModalButton');
    const listProductsModal = document.getElementById('listProductsModal');
    const productListContainer = document.getElementById('productListContainer');
    const closeListModalButton = document.getElementById('closeListModalButton');

    if (openListModalButton) {
        openListModalButton.addEventListener('click', () => {
            fetch('/get-products')
                .then(response => response.json())
                .then(data => {
                    const products = data.products;
                    productListContainer.innerHTML = ''; // Limpiar contenedor

                    products.forEach(product => {
                        productListContainer.insertAdjacentHTML('beforeend', `
                            <div class="productoEliminar">
                                <span>${product.product_name}</span>
                                <span>$${product.price}</span>
                                <span>${product.description}</span>
                                <span>${product.components}</span>
                            </div>
                        `);
                    });

                    listProductsModal.classList.remove('hidden');
                    listProductsModal.classList.add('show');
                })
                .catch(error => {
                    console.error('Error al obtener los productos:', error);
                });
        });
    }

    if (closeListModalButton) {
        closeListModalButton.addEventListener('click', () => {
            listProductsModal.classList.remove('show');
            listProductsModal.classList.add('hidden');
        });
    }
}); 

document.addEventListener('DOMContentLoaded', () => {
    const viewProductsButton = document.getElementById('viewProductsButton');

    if (viewProductsButton) {
        viewProductsButton.addEventListener('click', () => {
            window.location.href = '/HTML/productos.html';
        });
    } else {
        console.error("viewProductsButton no encontrado");
    }
});