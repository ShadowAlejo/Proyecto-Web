document.addEventListener('DOMContentLoaded', () => {
    const openModalButton = document.getElementById('addBestSellingProductButton');
    const closeModalButton = document.getElementById('closeAddBestSellingModalButton');
    const addProductModal = document.getElementById('addBestSellingProductModal');
    const modalContent = document.querySelector('.modal-content');
    const addProductForm = document.getElementById('addBestSellingProductForm');

    // Abrir el modal
    if (openModalButton && addProductModal) {
        openModalButton.addEventListener('click', () => {
            if (addProductModal.classList) {
                addProductModal.classList.remove('hidden');
                addProductModal.classList.add('show');
            }
        });
    } else {
        console.error("addBestSellingProductButton or addBestSellingProductModal is null");
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
        console.error("closeAddBestSellingModalButton or addBestSellingProductModal is null");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const openDeleteModalButton = document.getElementById('removeBestSellingProductButton');
    const closeDeleteModalButton = document.getElementById('closeDeleteBestSellingModalButton');
    const deleteProductModal = document.getElementById('deleteBestSellingProductModal');
    const productList = document.getElementById('bestSellingProductList');

    if (openDeleteModalButton && deleteProductModal) {
        openDeleteModalButton.addEventListener('click', () => {
            deleteProductModal.classList.remove('hidden');
            deleteProductModal.classList.add('show');
            loadBestSellingProductsForDeletion();
        });
    }

    if (closeDeleteModalButton && deleteProductModal) {
        closeDeleteModalButton.addEventListener('click', () => {
            deleteProductModal.classList.remove('show');
            deleteProductModal.classList.add('hidden');
        });
    }

    // Cerrar el modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === deleteProductModal) {
            deleteProductModal.classList.remove('show');
            deleteProductModal.classList.add('hidden');
        }
    });

    function loadBestSellingProductsForDeletion() {
        fetch('/get-best-selling-products')
            .then(response => response.json())
            .then(data => {
                productList.innerHTML = '';
                data.products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.className = 'productoEliminar flex justify-between items-center';
                    productItem.innerHTML = `
                        <span>${product.product_name}</span>
                        <button class="adminCardButton btnEliminar" data-product-id="${product.best_selling_id}">Eliminar</button>
                    `;
                    productList.appendChild(productItem);
                });

                const deleteButtons = document.querySelectorAll('.btnEliminar');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', (event) => {
                        const productId = event.target.getAttribute('data-product-id');
                        deleteBestSellingProduct(productId);
                    });
                });
            })
            .catch(error => {
                console.error('Error al cargar los productos de más vendidos para eliminación:', error);
                showNotification('Error al cargar los productos de más vendidos para eliminación', 'error');
            });
    }

    function deleteBestSellingProduct(productId) {
        fetch(`/delete-best-selling-product/${productId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Producto eliminado correctamente', 'success');
                loadBestSellingProductsForDeletion();
            } else {
                showNotification('Error al eliminar el producto', 'error');
            }
        })
        .catch(error => {
            console.error('Error al eliminar el producto de más vendidos:', error);
            showNotification('Ocurrió un error al intentar eliminar el producto', 'error');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const openListModalButton = document.getElementById('listBestSellingProductsButton');
    const listProductsModal = document.getElementById('listBestSellingProductsModal');
    const productListContainer = document.getElementById('bestSellingProductListContainer');
    const closeListModalButton = document.getElementById('closeListBestSellingModalButton');

    if (openListModalButton) {
        openListModalButton.addEventListener('click', () => {
            fetch('/get-best-selling-products')
                .then(response => response.json())
                .then(data => {
                    const products = data.products;
                    productListContainer.innerHTML = ''; // Limpiar contenedor

                    products.forEach(product => {
                        productListContainer.insertAdjacentHTML('beforeend', `
                            <div class="productoEliminar">
                                <span><strong>ID:</strong> ${product.product_id}</span>
                                <span><strong>Nombre:</strong> ${product.product_name}</span>
                                <span><strong>Descripción:</strong> ${product.description}</span>
                                <span><strong>Precio:</strong> $${product.price}</span>
                                <span><strong>Stock:</strong> ${product.stock}</span>
                                <span><strong>Componentes:</strong> ${product.components}</span>
                            </div>
                        `);
                    });

                    listProductsModal.classList.remove('hidden');
                    listProductsModal.classList.add('show');
                })
                .catch(error => {
                    console.error('Error al obtener los productos:', error);
                    showNotification('Error al obtener los productos', 'error');
                });
        });
    }

    if (closeListModalButton) {
        closeListModalButton.addEventListener('click', () => {
            listProductsModal.classList.remove('show');
            listProductsModal.classList.add('hidden');
        });
    }

    // Cerrar el modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === listProductsModal) {
            listProductsModal.classList.remove('show');
            listProductsModal.classList.add('hidden');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const viewProductsButton = document.getElementById('viewBestSellingProductsButton');

    if (viewProductsButton) {
        viewProductsButton.addEventListener('click', () => {
            window.location.href = '/HTML/index.html';
        });
    } else {
        console.error("viewBestSellingProductsButton no encontrado");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('addBestSellingProductModal');
    const modalContent = modal.querySelector('.modal-content');

    // Cerrar el modal al hacer clic fuera del contenido
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
        }
    });
});

// Función para mostrar notificaciones
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