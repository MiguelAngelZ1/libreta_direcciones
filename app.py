import psycopg2
from flask import Flask, render_template, request, redirect, flash
import os

app = Flask(__name__)
app.secret_key = "EMIteamo.2025"  # Necesaria para usar mensajes flash

# URL de conexión a PostgreSQL desde variables de entorno (o valor por defecto)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://libreta_db_user:A2OwJBOrJacD7MX38Y2XNisNprYVk066@dpg-d0548gvgi27c73cac2q0-a.oregon-postgres.render.com/libreta_db"
)

def db_connection():
    """Establece conexión con PostgreSQL usando una conexión optimizada."""
    try:
        return psycopg2.connect(
            DATABASE_URL,
            sslmode="require",
            connect_timeout=10  # Timeout para evitar bloqueos
        )
    except psycopg2.Error as e:
        print(f"Error de conexión a la base de datos: {e}")
        return None  # Retorna None en caso de error

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/menu")
def menu():
    return render_template("menu.html")

@app.route("/add", methods=["GET", "POST"])
def add():
    if request.method == "GET":
        # Cargar la página de agregar sin error
        return render_template("add.html", error=None)
    
    # --- PROCESAMIENTO DEL FORMULARIO (método POST) ---
    # Extraer datos del formulario
    grado = request.form.get("grado", "")  # Si tienes este campo, sino puedes omitirlo
    nombre_input = request.form.get("nombre", "").strip()
    apellido_input = request.form.get("apellido", "").strip()
    dni = request.form.get("dni", "").strip()

    # Validación de campos requeridos
    if not nombre_input or not apellido_input or not dni:
        error = "Todos los campos (nombre, apellido, DNI) son requeridos."
        return render_template("add.html", error=error)

    # Validación de DNI: debe contener solo números y tener al menos 7 dígitos.
    if not dni.isdigit() or len(dni) < 7:
        error = "El DNI debe contener solo números y tener al menos 7 dígitos."
        return render_template("add.html", error=error)

    # Transformación de datos:
    # - Para el nombre: cada palabra con la primera letra en mayúscula.
    # - Para el apellido: todo en mayúsculas.
    nombre = " ".join(word.capitalize() for word in nombre_input.split())
    apellido = apellido_input.upper()

    # Conexión a la base de datos
    conn = db_connection()
    if conn is None:
        error = "Error de conexión a la base de datos."
        return render_template("add.html", error=error)

    try:
        with conn:
            with conn.cursor() as cursor:
                # Inserta los datos en la tabla 'contactos'
                sql = """
                    INSERT INTO contactos (grado, nombre, apellido, dni)
                    VALUES (%s, %s, %s, %s)
                """
                cursor.execute(sql, (grado, nombre, apellido, dni))
        flash("Contacto agregado exitosamente.", "success")
        # Redirige al menú (o a otra página, como /view) una vez agregado el contacto
        return redirect("/menu")
    except Exception as e:
        print(f"Error al insertar contacto: {e}")
        error = "Error al agregar el contacto."
        return render_template("add.html", error=error)

@app.route("/view")
def view():
    conn = db_connection()
    if conn is None:
        return "Error de conexión a la base de datos"
    
    with conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, grado, nombre, apellido, dni FROM contactos ORDER BY nombre ASC")
            registros = cursor.fetchall()

    return render_template("view.html", registros=registros)

@app.route("/edit", methods=["POST"])
def edit():
    id_registro = request.form["id"]
    nuevo_grado = request.form["grado"]
    # Se aplican transformaciones similares a la ruta /add:
    nuevo_nombre = request.form["nombre"].strip().title()  # cada palabra con la primera letra mayúscula
    nuevo_apellido = request.form["apellido"].strip().upper()  # todo en mayúsculas
    nuevo_dni = request.form["dni"].strip()

    if not nuevo_dni.isdigit():
        return "Error: DNI debe contener solo números"

    conn = db_connection()
    if conn is None:
        return "Error de conexión a la base de datos"

    with conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE contactos 
                SET grado = %s, nombre = %s, apellido = %s, dni = %s 
                WHERE id = %s
            """, (nuevo_grado, nuevo_nombre, nuevo_apellido, nuevo_dni, id_registro))

    return redirect("/menu")

@app.route("/delete", methods=["GET", "POST"])
def delete():
    if request.method == "POST":
        id_registro = request.form["id"]

        conn = db_connection()
        if conn is None:
            return "Error de conexión a la base de datos"

        with conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM contactos WHERE id = %s", (id_registro,))
        return redirect("/menu")

    return render_template("delete.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
