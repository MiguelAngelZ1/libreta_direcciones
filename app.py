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

from flask import Flask, render_template, request, redirect, url_for, flash
import os
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
app.secret_key = "EMIteamo.2025"  # Recuerda usar variables de entorno en producción

# URL de conexión: utiliza variable de entorno o valor por defecto
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://libreta_db_user:A2OwJBOrJacD7MX38Y2XNisNprYVk066@dpg-d0548gvgi27c73cac2q0-a.oregon-postgres.render.com/libreta_db"
)

def db_connection():
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

@app.route("/add", methods=["GET", "POST"])
def add():
    if request.method == "POST":
        grado = request.form.get("grado", "").strip()
        nombre = request.form.get("nombre", "").strip()
        apellido = request.form.get("apellido", "").strip()
        dni = request.form.get("dni", "").strip()

        # Validaciones básicas
        if not nombre or not apellido or not dni:
            flash("❌ Todos los campos son requeridos.", "danger")
            print("DEBUG: Faltan datos")
        elif not dni.isdigit() or len(dni) != 8:
            flash("❌ El DNI debe contener solo números y tener 8 dígitos.", "danger")
            print("DEBUG: DNI inválido")
        else:
            conn = db_connection()
            if conn is None:
                flash("❌ Error de conexión a la base de datos.", "danger")
                print("DEBUG: Error de conexión")
            else:
                try:
                    with conn:
                        with conn.cursor() as cursor:
                            # Verificar si ya existe un contacto con ese DNI
                            consulta = "SELECT id FROM contactos WHERE dni = %s"
                            cursor.execute(consulta, (dni,))
                            if cursor.fetchone():
                                flash("❌ Ya existe un contacto con el mismo DNI.", "danger")
                                print("DEBUG: Contacto duplicado")
                            else:
                                sql = """
                                    INSERT INTO contactos (grado, nombre, apellido, dni)
                                    VALUES (%s, %s, %s, %s)
                                """
                                cursor.execute(sql, (grado, nombre.capitalize(), apellido.upper(), dni))
                                flash("✅ Contacto agregado correctamente.", "success")
                                print("DEBUG: Contacto agregado")
                except Exception as e:
                    flash("❌ Error al agregar el contacto.", "danger")
                    print(f"DEBUG: Error insertando en la base de datos: {e}")
        # Siempre redirijimos tras un POST para consumir el flash y evitar acumulación de mensajes
        return redirect(url_for("add"))

    return render_template("add.html")


@app.route("/view", methods=["GET"])
def view():
    q = request.args.get("q", "").strip()  # Parámetro de búsqueda (por defecto vacío)
    registros = []
    conn = db_connection()
    if conn is not None:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                if q:
                    # Busca por nombre o apellido (usando ILIKE para insensibilidad a mayúsculas)
                    query = """
                        SELECT id, grado, nombre, apellido, dni
                        FROM contactos
                        WHERE nombre ILIKE %s OR apellido ILIKE %s
                        ORDER BY nombre ASC
                    """
                    wildcard = f"%{q}%"
                    cursor.execute(query, (wildcard, wildcard))
                else:
                    # Si no se busca nada, muestra todos los contactos
                    cursor.execute("SELECT id, grado, nombre, apellido, dni FROM contactos ORDER BY nombre ASC")
                registros = cursor.fetchall()
    return render_template("view.html", registros=registros, q=q)



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

@app.route("/delete", methods=["POST"])
def delete():
    id_registro = request.form.get("id")
    conn = db_connection()
    if conn is None:
        flash("❌ Error de conexión a la base de datos.", "danger")
        return redirect(url_for("view"))
    try:
        with conn:
            with conn.cursor() as cursor:
                delete_sql = "DELETE FROM contactos WHERE id = %s"
                cursor.execute(delete_sql, (id_registro,))
        flash("✅ Contacto eliminado correctamente.", "success")
    except Exception as e:
        print(f"Error al eliminar contacto: {e}")
        flash("❌ Error al eliminar el contacto.", "danger")
    return redirect(url_for("view"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
