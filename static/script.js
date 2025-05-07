// Funcionalidad de búsqueda en la tabla con corrección de resaltado
document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("searchBox");
    if (searchBox) {
        searchBox.addEventListener("input", function () {
            let input = searchBox.value.toLowerCase().trim();
            let filas = document.querySelectorAll("#tableBody tr");
            filas.forEach(fila => {
                // Si el campo de búsqueda está vacío, mostramos la fila sin resaltado
                if (input === "") {
                    fila.style.display = "table-row";
                    fila.style.backgroundColor = "";
                } else {
                    let nombre = fila.dataset.nombre ? fila.dataset.nombre.toLowerCase() : "";
                    let apellido = fila.dataset.apellido ? fila.dataset.apellido.toLowerCase() : "";
                    let dni = fila.dataset.dni ? fila.dataset.dni.toString() : "";
                    if (nombre.includes(input) || apellido.includes(input) || dni.includes(input)) {
                        fila.style.display = "table-row";
                        fila.style.backgroundColor = "#ffff99";  // Resalta la fila
                    } else {
                        fila.style.display = "none";
                    }
                }
            });
        });
    }
});


// Validación del formulario de alta
function validarFormulario() {
    const gradoElem = document.getElementById("grado");
    const nombreElem = document.getElementById("nombre");
    const apellidoElem = document.getElementById("apellido");
    const dniElem = document.getElementById("dni");
    
    // Si alguno de estos elementos no está presente, se omite la validación
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

// Función para mostrar la alerta de éxito al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    let alerta = document.getElementById("alerta");
    if (alerta) {
        setTimeout(() => {
            alerta.classList.add("alert-hidden");
            setTimeout(() => {
                alerta.style.display = "none"; // Elimina el espacio en la interfaz
            }, 800); // Espera a que la transición termine
        }, 4000); // La alerta dura 4 segundos antes de ocultarse
    }
});




// Funciones para la edición

document.addEventListener("DOMContentLoaded", function () {
    console.log("Script.js cargado correctamente");

    // Asignar evento a los botones de edición
    const btnEditarList = document.querySelectorAll(".btn-editar");
    console.log("Botones de editar encontrados:", btnEditarList);
    btnEditarList.forEach(button => {
        button.addEventListener("click", function () {
            let id = this.dataset.id;
            let grado = this.dataset.grado;
            let nombre = this.dataset.nombre;
            let apellido = this.dataset.apellido;
            let dni = this.dataset.dni;

            console.log(`Editando contacto con ID ${id}`);
            abrirModal(id, grado, nombre, apellido, dni);
        });
    });

    // Asignar evento a los botones de eliminación
    const btnEliminarList = document.querySelectorAll(".btn-eliminar");
    console.log("Botones de eliminar encontrados:", btnEliminarList);
    btnEliminarList.forEach(button => {
        button.addEventListener("click", function () {
            let id = this.dataset.id;
            console.log(`Eliminando contacto con ID ${id}`);
            eliminarContacto(id);
        });
    });
});
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

function cerrarModal() {
    const editModal = document.getElementById("editModal");
    if (editModal) {
        editModal.style.display = "none";
    }
}

// Función para confirmar la edición del contacto
function confirmarEdicion(event) {
    event.preventDefault(); // Evita la redirección automática por el formulario

    let formData = new FormData(document.getElementById("editForm"));

    fetch("/edit", {
        method: "POST",
        body: formData
    })
    .then(response => response.text())
    .then(() => {
        alert("✅ Contacto editado correctamente.");
        location.reload(); // Recarga la página en lugar de redirigir
    })
    .catch(error => {
        alert("❌ Hubo un error al editar el contacto. Intenta nuevamente.");
        console.error("Error:", error);
    });
}


// Función para limpiar la búsqueda
function limpiarBusqueda() {
    const searchBox = document.getElementById("searchBox");
    if (searchBox) {
        searchBox.value = "";
    }
    document.querySelectorAll("#tableBody tr").forEach(fila => {
        fila.style.display = "table-row";
        fila.style.backgroundColor = "";
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


// Función para enviar el formulario de contacto
document.addEventListener("DOMContentLoaded", function() {
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            event.preventDefault();
            fetch(this.action, {
                method: this.method,
                body: new FormData(this)
            }).then(response => response.text())
              .then(() => {
                  this.reset();
              });
        });
    }
});
