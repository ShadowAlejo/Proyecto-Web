const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors'); // Asegúrate de importar cors
const multer = require('multer'); // Importa multer
const connection = require('../proyecto-Web/database');

const app = express();
const upload = multer(); // Configura multer

// Mantener esta parte intacta
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // Habilitar CORS si es necesario

// Configuración de multer para guardar las imágenes
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');  // Carpeta donde se guardarán las imágenes
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Renombrar archivo con la fecha actual
    }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Servir archivos estáticos desde las carpetas CSS, IMG y JSON
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/IMG', express.static(path.join(__dirname, 'IMG')));
app.use('/JS', express.static(path.join(__dirname, 'JS')));
app.use('/HTML', express.static(path.join(__dirname, 'HTML')));

// Middleware de sesión
app.use(session({
    secret: 'tu_secreto', // Cambia esto por una cadena secreta segura
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambia a true si usas HTTPS en producción
}));

// Ruta para la raíz '/' que sirve el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'HTML/index.html'));
});

// Ruta para manejar el registro de usuarios
app.post('/register', async (req, res) => {
    const { username, email, password, cedula } = req.body;

    try {
        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario en la base de datos
        const query = 'INSERT INTO users (username, email, password, cedula) VALUES (?, ?, ?, ?)';
        connection.query(query, [username, email, hashedPassword, cedula], (err, result) => {
            if (err) {
                console.error('Error al registrar el usuario:', err);
                return res.status(500).send('Error al registrar el usuario');
            }
            res.redirect('/HTML/login.html');
        });
    } catch (error) {
        console.error('Error en la encriptación de la contraseña:', error);
        res.status(500).send('Error en la encriptación de la contraseña');
    }
});

// Ruta para manejar el inicio de sesión
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const queryAdmins = 'SELECT * FROM admins WHERE email = ?';
    const queryUsers = 'SELECT * FROM users WHERE email = ?';

    try {
        // Verificar en la tabla de administradores
        connection.query(queryAdmins, [email], async (err, resultsAdmins) => {
            if (err) {
                console.error('Error en la consulta de inicio de sesión (admins):', err);
                return res.status(500).send('Error en la consulta de inicio de sesión');
            }

            if (resultsAdmins.length > 0) {
                const admin = resultsAdmins[0];
                const storedPassword = admin.password;

                // Verificar si la contraseña está encriptada
                const isHashed = storedPassword.startsWith('$2b$');

                if (isHashed) {
                    const passwordMatch = await bcrypt.compare(password, storedPassword);
                    if (passwordMatch) {
                        // Iniciar sesión para administrador
                        req.session.user = {
                            id: admin.admin_id,
                            name: admin.username,
                            email: admin.email,
                            isAdmin: true
                        };
                        console.log('Sesión iniciada (admin):', req.session.user);
                        return res.redirect('/HTML/index.html');
                    }
                } else {
                    if (password === storedPassword) {
                        // Encriptar la contraseña y actualizar en la base de datos
                        const hashedPassword = await bcrypt.hash(password, 10);
                        const updateQuery = 'UPDATE admins SET password = ? WHERE admin_id = ?';
                        connection.query(updateQuery, [hashedPassword, admin.admin_id], (err, result) => {
                            if (err) {
                                console.error('Error al actualizar la contraseña del administrador:', err);
                            } else {
                                console.log('Contraseña del administrador encriptada y actualizada.');
                            }
                        });

                        req.session.user = {
                            id: admin.admin_id,
                            name: admin.username,
                            email: admin.email,
                            isAdmin: true
                        };
                        console.log('Sesión iniciada (admin):', req.session.user);
                        return res.redirect('/HTML/index.html');
                    }
                }
            }

            // Verificar en la tabla de usuarios normales
            connection.query(queryUsers, [email], async (err, resultsUsers) => {
                if (err) {
                    console.error('Error en la consulta de inicio de sesión (users):', err);
                    return res.status(500).send('Error en la consulta de inicio de sesión');
                }

                if (resultsUsers.length > 0) {
                    const user = resultsUsers[0];
                    const passwordMatch = await bcrypt.compare(password, user.password);
                    if (passwordMatch) {
                        req.session.user = {
                            id: user.user_id,
                            name: user.username,
                            email: user.email,
                            cedula: user.cedula,
                            isAdmin: false
                        };
                        console.log('Sesión iniciada (usuario):', req.session.user);
                        return res.redirect('/HTML/index.html');
                    }
                }

                // Credenciales incorrectas
                res.status(401).send('Correo o contraseña incorrectos');
            });
        });
    } catch (error) {
        console.error('Error en el proceso de inicio de sesión:', error);
        res.status(500).send('Error en el proceso de inicio de sesión');
    }
});

// Ruta para verificar la sesión activa
app.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({
            sessionActive: true,
            user: req.session.user
        });
    } else {
        res.json({ sessionActive: false });
    }
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error al cerrar la sesión');
        }
        res.redirect('/HTML/login.html');
    });
});

//Ruta para subir la solicitud de contacto
app.post('/submit-contact', upload.none(), (req, res) => {
    console.log('Datos recibidos en el servidor:', req.body); // Verifica los datos recibidos

    const { username, email, fecha, asunto, mensaje } = req.body;

    if (!username || !email || !fecha || !asunto || !mensaje) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    const query = `INSERT INTO contact (username, email, fecha, asunto, mensaje) VALUES (?, ?, ?, ?, ?)`;
    connection.query(query, [username, email, fecha, asunto, mensaje], (err, result) => {
        if (err) {
            console.error('Error al guardar la solicitud de contacto:', err);
            return res.status(500).json({ success: false, message: 'Error al enviar la solicitud de contacto.' });
        }
    });
});

// Ruta para obtener productos
app.get('/get-products', (req, res) => {
    const query = 'SELECT * FROM products';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            return res.status(500).json({ error: 'Error al obtener los productos' });
        }
        
        res.json({ products: results });
    });
});

// Ruta para manejar el formulario con la imagen
app.post('/add-product', (req, res) => {
    const { product_name, description, price, stock, image_url, components } = req.body;

    const query = `INSERT INTO products (product_name, description, price, stock, image_url, components) VALUES (?, ?, ?, ?, ?, ?)`;
    connection.query(query, [product_name, description, price, stock, image_url, components], (err, result) => {
        if (err) {
            console.error('Error al agregar el producto:', err);
            return res.status(500).send('Error al agregar el producto.');
        }
        res.redirect('/HTML/productos.html');
    });
});

// Ruta para obtener todas las solicitudes
app.get('/get-solicitudes', (req, res) => {
    const query = 'SELECT * FROM contact';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener las solicitudes:', err);
            return res.status(500).json({ error: 'Error al obtener las solicitudes' });
        }
        res.json({ solicitudes: results });
    });
});

// Ruta para marcar una solicitud como hecha (eliminarla)
app.delete('/delete-solicitud/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM contact WHERE contact_id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar la solicitud:', err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

// Ruta para poner una solicitud en espera
app.post('/wait-solicitud/:id', (req, res) => {
    const id = req.params.id;
    const query = 'UPDATE contact SET estado = "En espera" WHERE contact_id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la solicitud:', err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

app.get('/get-products', (req, res) => {
    const query = 'SELECT * FROM products';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            return res.status(500).json({ error: 'Error al obtener los productos' });
        }
        
        res.json({ products: results });
    });
});

// Ruta para eliminar un producto de la base de datos
app.delete('/delete-product/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM products WHERE product_id = ?';

    connection.query(query, [productId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto:', err);
            return res.status(500).send('Error al eliminar el producto.');
        }
        res.status(200).json({ success: true, message: 'Producto eliminado correctamente.' });
    });
});

// Ruta para agregar un producto a la lista de más vendidos
app.post('/add-best-selling-product', (req, res) => {
    const { product_name, total_sales, last_sold_at } = req.body;

    // Obtener el product_id basado en el nombre del producto
    const queryGetProductId = 'SELECT product_id FROM products WHERE product_name = ?';
    connection.query(queryGetProductId, [product_name], (err, results) => {
        if (err) {
            console.error('Error al obtener el ID del producto:', err);
            return res.status(500).send('Error al obtener el ID del producto.');
        }

        if (results.length === 0) {
            return res.status(404).send('Producto no encontrado.');
        }

        const productId = results[0].product_id;

        // Insertar el producto en la tabla de más vendidos
        const queryInsertBestSelling = `INSERT INTO best_selling_products (product_id, total_sales, last_sold_at) VALUES (?, ?, ?)`;
        connection.query(queryInsertBestSelling, [productId, total_sales, last_sold_at], (err, result) => {
            if (err) {
                console.error('Error al agregar el producto a más vendidos:', err);
                return res.status(500).send('Error al agregar el producto a más vendidos.');
            }
            res.redirect('/HTML/index.html'); // Redirigir a una página de éxito o lista de productos más vendidos
        });
    });
});

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

app.delete('/delete-best-selling-product/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM best_selling_products WHERE best_selling_id = ?';

    connection.query(query, [productId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto de más vendidos:', err);
            return res.status(500).send('Error al eliminar el producto de más vendidos.');
        }
        res.status(200).json({ success: true, message: 'Producto eliminado correctamente.' });
    });
});


app.listen(3001, () => {
    console.log('Servidor corriendo en http://localhost:3001');
});