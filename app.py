import psycopg2
from flask import Flask, render_template, request, redirect

app = Flask(__name__)

# URL de conexión a PostgreSQL en Render
DATABASE_URL = "postgresql://libreta_db_user:A2OwJBOrJacD7MX38Y2XNisNprYVk066@dpg-d0548gvgi27c73cac2q0-a.oregon-postgres.render.com/libreta_db"

def db_connection():
    return psycopg2.connect(DATABASE_URL)

# Página principal
@app.route("/")
def index():
    return render_template("index.html")

# Menú principal
@app.route("/menu")
def menu():
    return render_template("menu.html")

# Agregar un registro
@app.route("/add", methods=["GET", "POST"])
def add():
    if request.method == "POST":
        grado = request.form["grado"]
        nombre = request.form["nombre"]
        apellido = request.form["apellido"]
        dni = request.form["dni"]

        conn = db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO contactos (grado, nombre, apellido, dni) VALUES (%s, %s, %s, %s)", (grado, nombre, apellido, dni))
        conn.commit()
        cursor.close()
        conn.close()

        return redirect("/menu")

    return render_template("add.html")

# Ver registros
@app.route("/view")
def view():
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contactos")
    registros = cursor.fetchall()
    cursor.close()
    conn.close()

    return render_template("view.html", registros=registros)

# Editar un registro
@app.route("/edit", methods=["GET", "POST"])
def edit():
    if request.method == "POST":
        id_registro = request.form["id"]
        nuevo_grado = request.form["grado"]
        nuevo_nombre = request.form["nombre"]
        nuevo_apellido = request.form["apellido"]
        nuevo_dni = request.form["dni"]

        conn = db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE contactos SET grado = %s, nombre = %s, apellido = %s, dni = %s WHERE id = %s",
                       (nuevo_grado, nuevo_nombre, nuevo_apellido, nuevo_dni, id_registro))
        conn.commit()
        cursor.close()
        conn.close()

        return redirect("/menu")

    return render_template("edit.html")

# Eliminar un registro
@app.route("/delete", methods=["GET", "POST"])
def delete():
    if request.method == "POST":
        id_registro = request.form["id"]

        conn = db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM contactos WHERE id = %s", (id_registro,))
        conn.commit()
        cursor.close()
        conn.close()

        return redirect("/menu")

    return render_template("delete.html")

if __name__ == "__main__":
    app.run(debug=True)
