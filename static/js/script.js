document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("searchBox");
    const filas = document.querySelectorAll("#tableBody tr");

    searchBox.addEventListener("input", function () {
        let input = searchBox.value.toLowerCase();

        filas.forEach(fila => {
            let nombre = fila.dataset.nombre;
            let apellido = fila.dataset.apellido;
            let dni = fila.dataset.dni;

            if (nombre.includes(input) || apellido.includes(input) || dni.includes(input)) {
                fila.style.display = "";  // Muestra solo los que coincidan
            } else {
                fila.style.display = "none";  // Oculta lo que no coincide
            }
        });
    });
});




// Funciones para manejar la edición y eliminación de contactos
function editarContacto(id, nombre, apellido, dni) {
    let nuevoNombre = prompt("Editar nombre:", nombre);
    let nuevoApellido = prompt("Editar apellido:", apellido);
    let nuevoDNI = prompt("Editar DNI:", dni);

    if (nuevoNombre && nuevoApellido && nuevoDNI) {
        fetch("/edit", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                id: id,
                nombre: nuevoNombre,
                apellido: nuevoApellido,
                dni: nuevoDNI
            })
        }).then(() => location.reload());
    }
}

function eliminarContacto(id) {
    if (confirm("¿Seguro que quieres eliminar este contacto?")) {
        fetch("/delete", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ id: id })
        }).then(() => location.reload());
    }
}
