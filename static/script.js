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
                fila.style.backgroundColor = "#ffff99";  // Resaltar coincidencias
            } else {
                fila.style.display = "none";  
            }
        });
    });
});

//Funcion para validar el formulario
function validarFormulario() {
    let grado = document.getElementById("grado").value.trim();
    let nombre = document.getElementById("nombre").value.trim();
    let apellido = document.getElementById("apellido").value.trim();
    let dni = document.getElementById("dni").value.trim();

    // Expresión regular estricta: solo permite letras y espacios
    let soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!grado || !nombre || !apellido || !dni) {
        alert("⚠️ Todos los campos son obligatorios.");
        return false;
    }

    if (!soloLetras.test(nombre) || !soloLetras.test(apellido)) {
        alert("❌ El nombre y el apellido solo pueden contener letras y espacios.");
        return false;
    }

    // Formatear correctamente antes de enviar los datos
    nombre = nombre.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    apellido = apellido.toUpperCase();

    document.getElementById("nombre").value = nombre;
    document.getElementById("apellido").value = apellido;

    return true;
}









// Funciones para manejar la edición y eliminación de contactos
function abrirModal(id, grado, nombre, apellido, dni) {
    document.getElementById("editId").value = id;
    document.getElementById("editGrado").value = grado;
    document.getElementById("editNombre").value = nombre;
    document.getElementById("editApellido").value = apellido;
    document.getElementById("editDni").value = dni;

    document.getElementById("editModal").style.display = "block";  
}


function cerrarModal() {
    document.getElementById("editModal").style.display = "none";  
}

//Funcion para confirmar la edición
function confirmarEdicion() {
    let id = document.getElementById("editId").value;
    let nuevoGrado = document.getElementById("editGrado").value;
    let nuevoNombre = document.getElementById("editNombre").value;
    let nuevoApellido = document.getElementById("editApellido").value;
    let nuevoDni = document.getElementById("editDni").value;

    if (!nuevoGrado || !nuevoNombre || !nuevoApellido || !nuevoDni) {
        alert("Error: Todos los campos deben estar completos.");
        return;
    }

    if (!confirm("¿Seguro que quieres guardar los cambios?")) {
        return;
    }

    fetch("/edit", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id, grado: nuevoGrado, nombre: nuevoNombre, apellido: nuevoApellido, dni: nuevoDni })
    }).then(() => {
        alert("✅ Contacto editado correctamente.");
        cerrarModal();
        location.reload();
    });
}

// Funcion Limpiar busqueda
function limpiarBusqueda() {
    document.getElementById("searchBox").value = "";
    document.querySelectorAll("#tableBody tr").forEach(fila => {
        fila.style.display = "table-row";
        fila.style.backgroundColor = "";  
    });
}


function eliminarContacto(id) {
    if (confirm("¿Seguro que quieres eliminar este contacto?")) {
        fetch("/delete", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ id: id })
        }).then(() => location.reload());
    }
    fetch("/delete", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id })
    }).then(() => {
        alert("❌ Contacto eliminado correctamente.");
        location.reload();
    });
    
}
