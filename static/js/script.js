document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("searchBox");
    const tableBody = document.getElementById("tableBody");
    const filas = tableBody.getElementsByTagName("tr");

    searchBox.addEventListener("input", function () {  // Se activa al escribir
        let input = searchBox.value.toLowerCase();

        for (let fila of filas) {
            let textoFila = fila.innerText.toLowerCase();  // Captura toda la fila

            if (textoFila.includes(input)) {
                fila.style.display = "";  // Muestra solo coincidencias
            } else {
                fila.style.display = "none";  // Oculta los que no coincidan
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
