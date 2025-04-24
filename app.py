import psycopg2
from flask import Flask, render_template, request, redirect
import os

app = Flask(__name__)

# URL de conexión a PostgreSQL desde variables de entorno
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://libreta_db_user:A2OwJBOrJacD7MX38Y2XNisNprYVk066@dpg-d0548gvgi27c73cac2q0-a.oregon-postgres.render.com/libreta_db")
def db_connection():
    """Establece conexión con PostgreSQL usando conexión optimizada."""
    try:
        return psycopg2.connect(
            DATABASE_URL,
            sslmode="require",
            connect_timeout=10  # Establece un timeout para evitar bloqueos
        )
    except psycopg2.Error as e:
        print(f"Error de conexión a la base de datos: {e}")
        return None  # Retorna None en caso de fallo

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/menu")
def menu():
    return render_template("menu.html")

@app.route("/add", methods=["GET", "POST"])
def add():
    if request.method == "GET":
        return render_template("add.html", error=None)  # Cargar la página correctamente.

    print("Solicitud recibida en /add")
    print("Datos enviados:", request.form)

    return "✅ Solicitud recibida correctamente en /add"






@app.route("/view")
def view():
    conn = db_connection()
    if conn is None:
        return "Error de conexión a la base de datos"
    
    with conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, grado, nombre, apellido, dni FROM contactos ORDER BY nombre ASC")  # Ordenado por nombre
            registros = cursor.fetchall()

    return render_template("view.html", registros=registros)


@app.route("/edit", methods=["POST"])
def edit():
    id_registro = request.form["id"]
    nuevo_grado = request.form["grado"]
    nuevo_nombre = request.form["nombre"].title()  # Aplica formato correcto
    nuevo_apellido = request.form["apellido"].upper()  # Aplica formato correcto
    nuevo_dni = request.form["dni"]

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
