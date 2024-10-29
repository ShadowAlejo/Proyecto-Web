document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('contactForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevenir el envío tradicional del formulario

        // Verificar la sesión del usuario antes de cualquier otra cosa
        fetch('http://localhost:3001/session')
            .then(response => response.json())
            .then(data => {
                if (!data.sessionActive) {
                    showModal('Debes iniciar sesión para enviar una solicitud de contacto.');
                } else {
                    validateFieldsAndSubmitForm(); // Solo se envía el formulario si la sesión está activa
                }
            })
            .catch(error => {
                console.error('Error al verificar la sesión:', error);
                showModal('Hubo un problema al verificar la sesión.', true);
            });
    });
});

function validateFieldsAndSubmitForm() {
    let valid = true;

    // Validación de los campos
    const usernameElement = document.getElementById('username');
    const emailElement = document.getElementById('email');
    const subjectElement = document.getElementById('asunto');
    const messageElement = document.getElementById('mensaje');
    const telefonoElement = document.getElementById('telefono');
    const dateElement = document.getElementById('fecha');

    const username = usernameElement.value.trim();
    const email = emailElement.value.trim();
    const subject = subjectElement.value.trim();
    const message = messageElement.value.trim();
    const telefono = telefonoElement.value.trim();
    const date = dateElement.value.trim();

    // Validaciones básicas
    if (username === '') {
        document.getElementById('usernameError').textContent = 'El nombre y el apellido es obligatorio';
        valid = false;
    }

    const emailPattern = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').textContent = 'Introduce un correo electrónico válido';
        valid = false;
    }

    if (subject === '') {
        document.getElementById('subjectError').textContent = 'El asunto es obligatorio';
        valid = false;
    }

    if (message === '') {
        document.getElementById('messageError').textContent = 'El mensaje es obligatorio';
        valid = false;
    }

    if (telefono === '') {
        document.getElementById('messageError').textContent = 'El telefono es obligatorio';
        valid = false;
    }

    if (date === '') {
        document.getElementById('dateError').textContent = 'La fecha es obligatoria';
        valid = false;
    }

    if (valid) {
        // Generar PDF antes de enviar la solicitud
        GenerarContactoPDF();

        const formData = new FormData(document.getElementById('contactForm'));

        // Mostrar los datos antes de enviarlos para depuración
        console.log('Datos enviados:', Array.from(formData.entries()));

        fetch('http://localhost:3001/submit-contact', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showModal(data.message);
                document.getElementById('contactForm').reset();
            } else {
                showModal(data.message, true);
            }
        })
        .catch(error => {
            console.error('Error al enviar la solicitud de contacto:', error);
            showModal('Hubo un problema al enviar tu solicitud.', true);
        });
    }
}

function showModal(message, isError = false) {
    const modal = document.getElementById('notificationModal');
    const messageElement = document.getElementById('notificationMessage');

    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.classList.remove('hidden');

        setTimeout(() => {
            closeModal();
        }, 5000);

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    } else {
        console.error('El modal o el mensaje del modal no existen.');
    }
}

function closeModal() {
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.classList.add('hidden');
    } else {
        console.error('El modal no existe.');
    }
}

function GenerarContactoPDF() {
    const nombre = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const asunto = document.getElementById('asunto').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const fecha = document.getElementById('fecha').value.trim();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;

    doc.setFont('times');
    doc.setFontSize(18);
    doc.text(77, y, 'Formulario de Contacto');
    y += 10;

    doc.setFontSize(12);
    doc.text(20, y, `Nombre: ${nombre}`);
    y += 10;
    doc.text(20, y, `Correo Electrónico: ${email}`);
    y += 10;
    doc.text(20, y, `Fecha: ${fecha}`);
    y += 10;
    doc.text(20, y, `Asunto: ${asunto}`);
    y += 10;
    doc.text(20, y, `Telefono: ${telefono}`);
    y += 10;
    doc.text(20, y, `Mensaje: ${mensaje}`);
    y += 10;

    doc.save('FormularioContacto.pdf');
}
