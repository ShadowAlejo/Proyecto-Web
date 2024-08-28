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
    // Modal para Eliminar Producto de Más Vendidos
    const openDeleteModalButton = document.getElementById('removeBestSellingProductButton');
    const closeDeleteModalButton = document.getElementById('closeDeleteBestSellingModalButton');
    const deleteProductModal = document.getElementById('deleteBestSellingProductModal');
    const deleteModalContent = deleteProductModal.querySelector('.modal-content');
    const productList = document.getElementById('bestSellingProductList');

    // Abrir el modal de eliminar productos de más vendidos
    if (openDeleteModalButton && deleteProductModal) {
        openDeleteModalButton.addEventListener('click', () => {
            deleteProductModal.classList.remove('hidden');
            deleteProductModal.classList.add('show');
            loadBestSellingProductsForDeletion();
        });
    }

    // Cerrar el modal de eliminar productos de más vendidos
    if (closeDeleteModalButton && deleteProductModal) {
        closeDeleteModalButton.addEventListener('click', () => {
            deleteProductModal.classList.remove('show');
            deleteProductModal.classList.add('hidden');
        });
    }

    // Cerrar el modal de eliminar productos de más vendidos al hacer clic fuera del contenido
    if (deleteProductModal) {
        deleteProductModal.addEventListener('click', (event) => {
            if (!deleteModalContent.contains(event.target)) {
                deleteProductModal.classList.remove('show');
                deleteProductModal.classList.add('hidden');
            }
        });
    }

    // Función para cargar productos de más vendidos en el modal de eliminación
    function loadBestSellingProductsForDeletion() {
        fetch('/get-best-selling-products')
            .then(response => response.json())
            .then(data => {
                productList.innerHTML = ''; // Limpiar la lista de productos
                data.products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.className = 'productoEliminar flex justify-between items-center';
                    productItem.innerHTML = `
                        <span>${product.product_name}</span>
                        <button class="adminCardButton btnEliminar" data-product-id="${product.best_selling_id}">Eliminar</button>
                    `;
                    productList.appendChild(productItem);
                });

                // Asignar eventos de clic a los botones de eliminación
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
            });
    }

    // Función para eliminar un producto de más vendidos de la base de datos
    function deleteBestSellingProduct(productId) {
        fetch(`/delete-best-selling-product/${productId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al eliminar el producto de más vendidos: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showNotification('Producto de más vendidos eliminado correctamente.');
                loadBestSellingProductsForDeletion(); // Recargar la lista de productos
            } else {
                showNotification('Error al eliminar el producto de más vendidos.', 'error');
            }
        })
        .catch(error => {
            console.error('Error al eliminar el producto de más vendidos:', error);
            showNotification('Error al eliminar el producto de más vendidos.', 'error');
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
                                <span>${product.product_name}</span>
                                <span>${product.total_sales} ventas</span>
                                <span>Última venta: ${product.last_sold_at}</span>
                            </div>
                        `);
                    });

                    listProductsModal.classList.remove('hidden');
                    listProductsModal.classList.add('show');
                })
                .catch(error => {
                    console.error('Error al obtener los productos de más vendidos:', error);
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
    const viewProductsButton = document.getElementById('viewBestSellingProductsButton');

    if (viewProductsButton) {
        viewProductsButton.addEventListener('click', () => {
            window.location.href = '/HTML/index.html';
        });
    } else {
        console.error("viewBestSellingProductsButton no encontrado");
    }
});

// Función para mostrar notificaciones (puedes personalizarla)
function showNotification(message, type = 'success') {
    alert(message); // Puedes usar una librería o implementar una notificación más elegante
}

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
