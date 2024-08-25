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
    const { product_name, description, price, stock, image_url } = req.body;

    const query = `INSERT INTO products (product_name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)`;
    connection.query(query, [product_name, description, price, stock, image_url], (err, result) => {
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

app.listen(3001, () => {
    console.log('Servidor corriendo en http://localhost:3001');
});