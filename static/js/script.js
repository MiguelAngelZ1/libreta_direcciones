document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("searchBox");
    const tableBody = document.getElementById("tableBody");

    // Búsqueda en tiempo real
    searchBox.addEventListener("keyup", function () {
        let input = searchBox.value.toLowerCase();
        let filas = tableBody.getElementsByTagName("tr");

        for (let fila of filas) {
            let nombre = fila.cells[2].innerText.toLowerCase();
            let apellido = fila.cells[3].innerText.toLowerCase();
            let dni = fila.cells[4].innerText.toLowerCase();

            if (nombre.includes(input) || apellido.includes(input) || dni.includes(input)) {
                fila.style.display = "";
            } else {
                fila.style.display = "none";
            }
        }
    });
});

// Función para editar contacto
function editarContacto(id, nombre, apellido, dni) {
    let nuevoNombre = prompt("Editar nombre:", nombre);
    let nuevoApellido = prompt("Editar apellido:", apellido);
    let nuevoDNI = prompt("Editar DNI:", dni);

    if (nuevoNombre && nuevoApellido && nuevoDNI) {
        fetch("/edit", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${id}&nombre=${nuevoNombre}&apellido=${nuevoApellido}&dni=${nuevoDNI}`
        }).then(() => location.reload());
    }
}

// Función para eliminar contacto
function eliminarContacto(id) {
    if (confirm("¿Seguro que quieres eliminar este contacto?")) {
        fetch("/delete", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${id}`
        }).then(() => location.reload());
    }
}
