document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("searchBox");
    const tableBody = document.getElementById("tableBody");

    searchBox.addEventListener("input", function () {  // Detecta cambios en tiempo real
        let input = searchBox.value.toLowerCase();
        let filas = tableBody.getElementsByTagName("tr");

        for (let fila of filas) {
            let nombre = fila.cells[2].innerText.toLowerCase();
            let apellido = fila.cells[3].innerText.toLowerCase();
            let dni = fila.cells[4].innerText.toLowerCase();

            if (nombre.includes(input) || apellido.includes(input) || dni.includes(input)) {
                fila.style.display = "";  // Muestra los que coinciden
            } else {
                fila.style.display = "none";  // Oculta los que no coinciden
            }
        }
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
