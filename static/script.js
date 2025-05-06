document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("searchBox");

    searchBox.addEventListener("input", function () {
        let input = searchBox.value.toLowerCase().trim();
        let filas = document.querySelectorAll("#tableBody tr");

        filas.forEach(fila => {
            let nombre = fila.dataset.nombre ? fila.dataset.nombre.toLowerCase() : "";
            let apellido = fila.dataset.apellido ? fila.dataset.apellido.toLowerCase() : "";
            let dni = fila.dataset.dni ? fila.dataset.dni.toLowerCase() : "";

            if (nombre.includes(input) || apellido.includes(input) || dni.includes(input)) {
                fila.style.display = "table-row";  
                fila.style.backgroundColor = "#ffff99";  // Resalta la fila
            } else {
                fila.style.display = "none";  
            }
        });
    });
});

/* ========================
   FUNCIONES DE VALIDACIÓN
   ======================== */

/**
 * Valida que un texto contenga solo letras (incluyendo acentos, Ñ y espacios).
 * @param {string} texto 
 * @returns {boolean}
 */
function validarSoloLetras(texto) {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    return regex.test(texto);
}

/**
 * Valida que un texto contenga solo números.
 * @param {string} texto 
 * @returns {boolean}
 */
function validarSoloNumeros(texto) {
    const regex = /^\d+$/;
    return regex.test(texto);
}

/* ========================
   VALIDACIÓN DE FORMULARIO DE CREACIÓN
   ======================== */
function validarFormulario() {
    let grado = document.getElementById("grado").value.trim();
    let nombre = document.getElementById("nombre").value.trim();
    let apellido = document.getElementById("apellido").value.trim();
    let dni = document.getElementById("dni").value.trim();

    if (!grado || !nombre || !apellido || !dni) {
        alert("⚠️ Todos los campos son obligatorios.");
        return false;
    }

    // Validar que 'nombre' y 'apellido' contengan solo letras y espacios (acepta acentos y ñ)
    if (!validarSoloLetras(nombre) || !validarSoloLetras(apellido)) {
        alert("❌ El nombre y el apellido solo pueden contener letras y espacios.");
        return false;
    }

    // Formatear: cada palabra del nombre con mayúscula inicial y apellido en mayúsculas
    nombre = nombre.split(" ")
                   .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                   .join(" ");
    apellido = apellido.toUpperCase();

    document.getElementById("nombre").value = nombre;
    document.getElementById("apellido").value = apellido;

    return true;
}

/* ========================
   FUNCIONES PARA LA EDICIÓN
   ======================== */

// Abre el modal de edición y carga los datos del contacto
function abrirModal(id, grado, nombre, apellido, dni) {
    document.getElementById("editId").value = id;
    document.getElementById("editGrado").value = grado;
    document.getElementById("editNombre").value = nombre;
    document.getElementById("editApellido").value = apellido;
    document.getElementById("editDni").value = dni;
    document.getElementById("editModal").style.display = "block";  
}

// Cierra el modal de edición
function cerrarModal() {
    document.getElementById("editModal").style.display = "none";  
}

// Confirma la edición validando que tanto el nombre como el apellido contengan solo letras y espacios,
// y que el DNI contenga solamente números.
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

    // Validar que el nombre solo contenga letras y espacios
    if (!validarSoloLetras(nuevoNombre)) {
        alert("Error: El nombre solo puede contener letras y espacios.");
        return;
    }

    // Validar que el apellido solo contenga letras y espacios
    if (!validarSoloLetras(nuevoApellido)) {
        alert("Error: El apellido solo puede contener letras y espacios.");
        return;
    }

    // Validar que el DNI contenga solo números
    if (!validarSoloNumeros(nuevoDni)) {
        alert("Error: El DNI debe contener solo números.");
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

/* ========================
   FUNCIONES DE ELIMINACIÓN Y BÚSQUEDA
   ======================== */

// Función para limpiar la búsqueda
function limpiarBusqueda() {
    document.getElementById("searchBox").value = "";
    document.querySelectorAll("#tableBody tr").forEach(fila => {
        fila.style.display = "table-row";
        fila.style.backgroundColor = "";
    });
}

// Función para eliminar un contacto (única petición)
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
