import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, render_template, request, redirect, flash, url_for
import os

app = Flask(__name__)
app.secret_key = "EMIteamo.2025"  # Recuerda usar variables de entorno en producción

# URL de conexión a PostgreSQL (desde variable de entorno o valor por defecto)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://libreta_db_user:A2OwJBOrJacD7MX38Y2XNisNprYVk066@dpg-d0548gvgi27c73cac2q0-a.oregon-postgres.render.com/libreta_db"
)

def db_connection():
    """Establece la conexión a PostgreSQL."""
    try:
        return psycopg2.connect(
            DATABASE_URL,
            sslmode="require",
            connect_timeout=10
        )
    except psycopg2.Error as e:
        print(f"Error de conexión a la base de datos: {e}")
        return None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/menu")
def menu():
    return render_template("index.html")

@app.route("/add", methods=["GET", "POST"])
def add():
    if request.method == "GET":
        return render_template("add.html", error=None)
    
    # Procesamiento del formulario de alta
    grado = request.form.get("grado", "").strip()
    nombre_input = request.form.get("nombre", "").strip()
    apellido_input = request.form.get("apellido", "").strip()
    dni = request.form.get("dni", "").strip()

    # Validación de campos obligatorios
    if not nombre_input or not apellido_input or not dni:
        error = "Todos los campos (nombre, apellido, DNI) son requeridos."
        return render_template("add.html", error=error)
    
    # Validación del formato del DNI
    if not dni.isdigit() or len(dni) != 8:
        error = "El DNI debe contener solo números y tener exactamente 8 dígitos."
        return render_template("add.html", error=error)

    conn = db_connection()
    if conn is None:
        error = "Error de conexión a la base de datos."
        return render_template("add.html", error=error)

    try:
        with conn:
            with conn.cursor() as cursor:
                # Validación de duplicados
                query = "SELECT id FROM contactos WHERE dni = %s"
                cursor.execute(query, (dni,))
                if cursor.fetchone() is not None:
                    error = "Ya existe un contacto con el mismo DNI."
                    return render_template("add.html", error=error)
                
                # Transformación de datos:
                # - Nombre: cada palabra con la primera letra en mayúscula.
                # - Apellido: todo en MAYÚSCULAS.
                nombre = " ".join(word.capitalize() for word in nombre_input.split())
                apellido = apellido_input.upper()

                sql = """
                    INSERT INTO contactos (grado, nombre, apellido, dni)
                    VALUES (%s, %s, %s, %s)
                """
                cursor.execute(sql, (grado, nombre, apellido, dni))
            flash("Contacto agregado exitosamente.", "success")
                return redirect(url_for("add"))

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
        # Se usa RealDictCursor para obtener cada registro como diccionario
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id, grado, nombre, apellido, dni FROM contactos ORDER BY nombre ASC")
            registros = cursor.fetchall()
    return render_template("view.html", registros=registros)

@app.route("/edit", methods=["POST"])
def edit():
    id_registro = request.form["id"]
    nuevo_grado = request.form["grado"].strip()
    nuevo_nombre = request.form["nombre"].strip()
    nuevo_apellido = request.form["apellido"].strip()
    nuevo_dni = request.form["dni"].strip()

    if not nuevo_dni.isdigit() or len(nuevo_dni) != 8:
        flash("Error: El DNI debe contener solo números y tener exactamente 8 dígitos.", "danger")
        return redirect(url_for("view"))
    
    conn = db_connection()
    if conn is None:
        flash("Error de conexión a la base de datos.", "danger")
        return redirect(url_for("view"))
    
    try:
        with conn:
            with conn.cursor() as cursor:
                query = "SELECT id FROM contactos WHERE dni = %s AND id <> %s"
                cursor.execute(query, (nuevo_dni, id_registro))
                duplicate = cursor.fetchone()
                if duplicate is not None:
                    flash("Error: Ya existe otro contacto con el mismo DNI.", "danger")
                    return redirect(url_for("view"))
                
                nuevo_nombre = " ".join(word.capitalize() for word in nuevo_nombre.split())
                nuevo_apellido = nuevo_apellido.upper()

                update_sql = """
                    UPDATE contactos 
                    SET grado = %s, nombre = %s, apellido = %s, dni = %s 
                    WHERE id = %s
                """
                cursor.execute(update_sql, (nuevo_grado, nuevo_nombre, nuevo_apellido, nuevo_dni, id_registro))
        flash("Contacto actualizado exitosamente.", "success")
    except Exception as e:
        print(f"Error al actualizar contacto: {e}")
        flash("Error al actualizar el contacto.", "danger")
    
    return redirect(url_for("index"))

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
        return redirect(url_for("index"))
    
    return render_template("delete.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
