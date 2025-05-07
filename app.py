import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, render_template, request, flash, redirect, url_for
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

def obtener_contactos():
    """Obtiene la lista de contactos desde la base de datos."""
    conn = db_connection()
    if conn is None:
        return []
    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id, grado, nombre, apellido, dni FROM contactos ORDER BY nombre ASC")
            return cursor.fetchall()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/add", methods=["GET", "POST"])
def add():
    mensaje = None  # Inicializa el mensaje vacío

    if request.method == "POST":
        grado = request.form.get("grado", "").strip()
        nombre = request.form.get("nombre", "").strip()
        apellido = request.form.get("apellido", "").strip()
        dni = request.form.get("dni", "").strip()

        if not nombre or not apellido or not dni:
            mensaje = "❌ Todos los campos son requeridos."

        elif not dni.isdigit() or len(dni) != 8:
            mensaje = "❌ El DNI debe contener solo números y tener 8 dígitos."

        else:
            conn = db_connection()
            if conn is None:
                mensaje = "❌ Error de conexión a la base de datos."
            else:
                try:
                    with conn:
                        with conn.cursor() as cursor:
                            query = "SELECT id FROM contactos WHERE dni = %s"
                            cursor.execute(query, (dni,))
                            if cursor.fetchone():
                                mensaje = "❌ Ya existe un contacto con el mismo DNI."
                            else:
                                sql = "INSERT INTO contactos (grado, nombre, apellido, dni) VALUES (%s, %s, %s, %s)"
                                cursor.execute(sql, (grado, nombre.capitalize(), apellido.upper(), dni))
                                mensaje = "✅ Contacto agregado correctamente."
                except Exception as e:
                    print(f"Error al insertar contacto: {e}")
                    mensaje = "❌ Error al agregar el contacto."

    return render_template("add.html", mensaje=mensaje)




@app.route("/view")
def view():
    registros = obtener_contactos()
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
        return render_template("view.html", registros=obtener_contactos())

    conn = db_connection()
    if conn is None:
        flash("Error de conexión a la base de datos.", "danger")
        return render_template("view.html", registros=obtener_contactos())

    try:
        with conn:
            with conn.cursor() as cursor:
                query = "SELECT id FROM contactos WHERE dni = %s AND id <> %s"
                cursor.execute(query, (nuevo_dni, id_registro))
                duplicate = cursor.fetchone()
                if duplicate is not None:
                    flash("Error: Ya existe otro contacto con el mismo DNI.", "danger")
                    return render_template("view.html", registros=obtener_contactos())

                nuevo_nombre = " ".join(word.capitalize() for word in nuevo_nombre.split())
                nuevo_apellido = nuevo_apellido.upper()

                update_sql = """
                    UPDATE contactos 
                    SET grado = %s, nombre = %s, apellido = %s, dni = %s 
                    WHERE id = %s
                """
                cursor.execute(update_sql, (nuevo_grado, nuevo_nombre, nuevo_apellido, nuevo_dni, id_registro))
        flash("✅ Contacto actualizado correctamente.")
    except Exception as e:
        print(f"Error al actualizar contacto: {e}")
        flash("❌ Error al actualizar el contacto.", "danger")

    return render_template("view.html", registros=obtener_contactos())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
