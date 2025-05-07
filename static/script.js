// Validación del formulario de alta
function validarFormulario() {
    const gradoElem = document.getElementById("grado");
    const nombreElem = document.getElementById("nombre");
    const apellidoElem = document.getElementById("apellido");
    const dniElem = document.getElementById("dni");
    
    if (!gradoElem || !nombreElem || !apellidoElem || !dniElem) {
        return true;
    }
    
    let grado = gradoElem.value.trim();
    let nombre = nombreElem.value.trim();
    let apellido = apellidoElem.value.trim();
    let dni = dniElem.value.trim();

    if (!grado || !nombre || !apellido || !dni) {
        alert("⚠️ Todos los campos son obligatorios.");
        return false;
    }
    
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!soloLetras.test(nombre) || !soloLetras.test(apellido)) {
        alert("❌ El nombre y el apellido solo pueden contener letras y espacios.");
        return false;
    }
    
    const soloNumeros = /^\d+$/;
    if (!soloNumeros.test(dni) || dni.length != 8) {
        alert("❌ El DNI debe contener solo números y tener exactamente 8 dígitos.");
        return false;
    }
    
    // Formatear nombre y apellido antes de enviar el formulario
    nombre = nombre.split(" ")
                   .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                   .join(" ");
    apellido = apellido.toUpperCase();
    nombreElem.value = nombre;
    apellidoElem.value = apellido;
    
    return true;
}

// Función para abrir el modal de edición
function abrirModal(id, grado, nombre, apellido, dni) {
    const editModal = document.getElementById("editModal");
    if (editModal) {
        document.getElementById("editId").value = id;
        document.getElementById("editGrado").value = grado;
        document.getElementById("editNombre").value = nombre;
        document.getElementById("editApellido").value = apellido;
        document.getElementById("editDni").value = dni;
        editModal.style.display = "block";
    }
}

// Función para cerrar el modal de edición
function cerrarModal() {
    const editModal = document.getElementById("editModal");
    if (editModal) {
        editModal.style.display = "none";
    }
}

// Función para confirmar la edición del contacto
function confirmarEdicion(event) {
    event.preventDefault();

    let formData = new FormData(document.getElementById("editForm"));

    fetch("/edit", {
        method: "POST",
        body: formData
    })
    .then(response => response.text())
    .then(() => {
        alert("✅ Contacto editado correctamente.");
        location.reload();
    })
    .catch(error => {
        alert("❌ Hubo un error al editar el contacto. Intenta nuevamente.");
        console.error("Error:", error);
    });
}

// Función para eliminar un contacto
function eliminarContacto(id) {
    if (confirm("¿Seguro que quieres eliminar este contacto?")) {
        fetch("/delete", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ id: id })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al eliminar contacto (status ${response.status})`);
            }
            return response.text();
        })
        .then(() => {
            alert("❌ Contacto eliminado correctamente.");
            location.reload();
        })
        .catch(error => {
            alert(`Error: No se pudo eliminar el contacto. ${error.message}`);
        });
    }
}

// Función para ocultar automáticamente los mensajes flash después de unos segundos
document.addEventListener("DOMContentLoaded", function () {
    const alerts = document.querySelectorAll('.alert.fade');
    
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.classList.remove('show');
        }, 2000);
    });
});
