// Espera a que se haya cargado por completo el DOM
document.addEventListener("DOMContentLoaded", function () {
    // FLASH MODAL: Mostrar modal de flash si hay mensajes, y asignar su cierre
    const flashModal = document.getElementById("flashModal");
    if (flashModal) {
        const flashBody = flashModal.querySelector(".modal-body");
        if (flashBody && flashBody.innerHTML.trim() !== "") {
            flashModal.style.display = "block";
        }
        const closeFlash = document.getElementById("closeFlash");
        if (closeFlash) {
            closeFlash.addEventListener("click", function () {
                flashModal.style.display = "none";
            });
        }
        window.addEventListener("click", function (event) {
            if (event.target === flashModal) {
                flashModal.style.display = "none";
            }
        });
    }
    
    // BUSQUEDA: controla el input del buscador
    const searchBox = document.getElementById("searchBox");
    if (searchBox) {
        searchBox.addEventListener("input", function () {
            let input = searchBox.value.toLowerCase().trim();
            let filas = document.querySelectorAll("#tableBody tr");
            filas.forEach(fila => {
                let nombre = fila.dataset.nombre ? fila.dataset.nombre.toLowerCase() : "";
                let apellido = fila.dataset.apellido ? fila.dataset.apellido.toLowerCase() : "";
                let dni = fila.dataset.dni ? fila.dataset.dni.toString() : "";
                if (nombre.includes(input) || apellido.includes(input) || dni.includes(input)) {
                    fila.style.display = "table-row";
                    fila.style.backgroundColor = "#ffff99";  // Resalta la fila
                } else {
                    fila.style.display = "none";
                }
            });
        });
    }
    
    // Listener para el formulario de alta (si existe)
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Evita el reload por defecto
            // Se valida el formulario (si algún campo falta, se aborta)
            if (!validarFormulario()) {
                return;
            }
            fetch(this.action, {
                method: this.method,
                body: new FormData(this)
            }).then(response => response.text())
              .then(() => {
                  this.reset(); // Limpia el formulario tras envío exitoso
              });
        });
    }
    
    // Asignar listeners a los botones de edición usando data attributes
    document.querySelectorAll(".btn-editar").forEach(button => {
        button.addEventListener("click", function () {
            let id = this.dataset.id;
            let grado = this.dataset.grado;
            let nombre = this.dataset.nombre;
            let apellido = this.dataset.apellido;
            let dni = this.dataset.dni;
            abrirModal(id, grado, nombre, apellido, dni);
        });
    });
    
    // Asignar listeners a los botones de eliminación usando data attributes
    document.querySelectorAll(".btn-eliminar").forEach(button => {
        button.addEventListener("click", function () {
            let id = this.dataset.id;
            eliminarContacto(id);
        });
    });
});

// VALIDACIÓN DEL FORMULARIO DE ALTA
function validarFormulario() {
    const gradoElem = document.getElementById("grado");
    const nombreElem = document.getElementById("nombre");
    const apellidoElem = document.getElementById("apellido");
    const dniElem = document.getElementById("dni");
    
    // Si alguno de estos elementos no existe (por ejemplo, en otra vista), se omite la validación
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
    
    // Formatear nombre y apellido antes de enviar
    nombre = nombre.split(" ")
                   .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                   .join(" ");
    apellido = apellido.toUpperCase();
    nombreElem.value = nombre;
    apellidoElem.value = apellido;
    
    return true;
}

// FUNCIONES PARA LA EDICIÓN
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

function confirmarEdicion() {
    let id = document.getElementById("editId").value;
    let nuevoGrado = document.getElementById("editGrado").value.trim();
    let nuevoNombre = document.getElementById("editNombre").value.trim();
    let nuevoApellido = document.getElementById("editApellido").value.trim();
    let nuevoDni = document.getElementById("editDni").value.trim();

    if (!nuevoGrado || !nuevoNombre || !nuevoApellido || !nuevoDni) {
        alert("Error: Todos los campos deben estar completos.");
        return;
    }

    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!soloLetras.test(nuevoNombre)) {
        alert("Error: El nombre solo puede contener letras y espacios.");
        return;
    }
    if (!soloLetras.test(nuevoApellido)) {
        alert("Error: El apellido solo puede contener letras y espacios.");
        return;
    }

    const soloNumeros = /^\d+$/;
    if (!soloNumeros.test(nuevoDni) || nuevoDni.length != 8) {
        alert("Error: El DNI debe contener solo números y tener exactamente 8 dígitos.");
        return;
    }
    
    if (!confirm("¿Seguro que quieres guardar los cambios?")) {
        return;
    }

    fetch("/edit", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            id: id,
            grado: nuevoGrado,
            nombre: nuevoNombre,
            apellido: nuevoApellido,
            dni: nuevoDni
        })
    }).then(() => {
        alert("✅ Contacto editado correctamente.");
        cerrarModal();
        location.reload();
    });
}

// FUNCION PARA LIMPIAR LA BUSQUEDA: Resetea el input y muestra todas las filas de la tabla
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

// FUNCION PARA ELIMINAR UN CONTACTO
function eliminarContacto(id) {
    if (confirm("¿Seguro que quieres eliminar este contacto?")) {
        fetch("/delete", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ id: id })
        }).then(() => {
            alert("❌ Contacto eliminado correctamente.");
            location.reload();
        });
    }
}
