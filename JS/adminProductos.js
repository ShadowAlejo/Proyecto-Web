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

    // Cargar productos desde la base de datos
    loadProducts();

    // Función para cargar productos desde la base de datos
    function loadProducts() {
        fetch('/get-products')
            .then(response => response.json())
            .then(data => {
                const productContainer = document.querySelector('.divSeccionProductos');
                productContainer.innerHTML = ''; // Limpiar el contenedor de productos
                data.products.forEach(product => {
                    const productCard = `
                        <div class="productoCartas">
                            <img src="${product.image_url}" alt="${product.product_name}" class="imagen">
                            <div class="p-4">
                                <h3 class="tituloOrdenador">${product.product_name}</h3>
                                <p class="descripcionRapida">${product.description}</p>
                                <div class="divBtn">
                                    <span class="precio">$${product.price.toFixed(2)}</span>
                                    <button class="btnComprar" data-product="${product.product_name}" data-price="${product.price}">Comprar</button> 
                                </div>
                            </div>
                        </div>
                    `;
                    productContainer.insertAdjacentHTML('beforeend', productCard);
                });
            })
            .catch(error => {
                console.error('Error al cargar los productos:', error);
            });
    }
});