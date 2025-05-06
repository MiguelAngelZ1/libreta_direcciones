# app/utils.py

def formatear_datos(nombre_input, apellido_input):
    """
    Transforma el nombre a formato Capitalized (cada palabra con la primera letra mayúscula)
    y el apellido a MAYÚSCULAS.
    Ejemplo: "MIGUEL imperio" -> ("Miguel", "IMPERIO")
    """
    nombre_formateado = ' '.join(word.capitalize() for word in nombre_input.strip().split())
    apellido_formateado = apellido_input.strip().upper()
    return nombre_formateado, apellido_formateado
