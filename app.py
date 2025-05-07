from flask import Flask, render_template, request, redirect, url_for
import os
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
app.secret_key = "EMIteamo.2025"

# URL de conexión: asegúrate de actualizarla o usar variables de entorno en producción
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

@app.route("/add", methods=["GET", "POST"])
def add():
    mensaje = None  # Variable para asignar mensaje de error o éxito

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
                            # Verificar si ya existe un contacto con ese DNI
                            query = "SELECT id FROM contactos WHERE dni = %s"
                            cursor.execute(query, (dni,))
                            if cursor.fetchone():
                                mensaje = "❌ Ya existe un contacto con el mismo DNI."
                            else:
                                sql = """
                                    INSERT INTO contactos (grado, nombre, apellido, dni)
                                    VALUES (%s, %s, %s, %s)
                                """
                                cursor.execute(sql, (grado, nombre.capitalize(), apellido.upper(), dni))
                                mensaje = "✅ Contacto agregado correctamente."
                except Exception as e:
                    print(f"Error al insertar contacto: {e}")
                    mensaje = "❌ Error al agregar el contacto."

        # Si se agregó correctamente el contacto, redirigimos para limpiar el formulario
        if mensaje and "✅" in mensaje:
            return redirect(url_for("add"))
    
    return render_template("add.html", mensaje=mensaje)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
