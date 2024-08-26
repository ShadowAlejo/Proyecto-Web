document.addEventListener('DOMContentLoaded', () => {
    fetchSolicitudes();

    document.querySelector('#solicitudesBody').addEventListener('click', function(e) {
        if (e.target.classList.contains('btnHecha')) {
            const id = e.target.dataset.id;
            marcarComoHecha(id);
        } else if (e.target.classList.contains('btnEspera')) {
            const id = e.target.dataset.id;
            ponerEnEspera(id);
        }
    });
});

function fetchSolicitudes() {
    fetch('/get-solicitudes')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#solicitudesBody');
            tbody.innerHTML = '';
            data.solicitudes.forEach(solicitud => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="border px-4 py-2">${solicitud.username}</td>
                    <td class="border px-4 py-2">${solicitud.email}</td>
                    <td class="border px-4 py-2">${solicitud.fecha}</td>
                    <td class="border px-4 py-2">${solicitud.asunto}</td>
                    <td class="border px-4 py-2">${solicitud.mensaje}</td>
                    <td class="border px-4 py-2">
                        <button data-id="${solicitud.contact_id}" class="btnHecha">Marcar como Hecha</button>
                        <button data-id="${solicitud.contact_id}" class="btnEspera">Poner en Espera</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error al obtener las solicitudes:', error));
}

function marcarComoHecha(id) {
    fetch(`/delete-solicitud/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Solicitud finalizada', 'success');
                fetchSolicitudes(); // Recargar la lista de solicitudes
            } else {
                alert('Error al marcar la solicitud como hecha');
            }
        })
        .catch(error => console.error('Error al marcar la solicitud como hecha:', error));
}

function ponerEnEspera(id) {
    fetch(`/wait-solicitud/${id}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Solicitud en espera', 'warning');
                fetchSolicitudes(); // Recargar la lista de solicitudes
            } else {
                alert('Error al poner la solicitud en espera');
            }
        })
        .catch(error => console.error('Error al poner la solicitud en espera:', error));
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error' : ''} ${type === 'warning' ? 'warning' : ''}`;
    notification.innerText = message;
    document.body.appendChild(notification);

    // Mostrar la notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Ocultar la notificación después de 6 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 6000);
}
