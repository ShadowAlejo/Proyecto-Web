document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const cedulaInput = document.getElementById('cedula');
    const passwordInput = document.getElementById('password');

    form.addEventListener('submit', function (event) {
        let valid = true;

        // Validación de la cédula
        const cedulaPattern = /^\d{10}$/;
        if (!cedulaPattern.test(cedulaInput.value)) {
            alert('La cédula debe contener exactamente 10 dígitos numéricos.');
            valid = false;
        }

        // Validación de la contraseña
        if (passwordInput.value.length < 10) {
            alert('La contraseña debe tener al menos 10 caracteres.');
            valid = false;
        }

        if (!valid) {
            event.preventDefault();
        }
    });
});