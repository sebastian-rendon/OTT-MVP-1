from database_connection import obtener_conexion
from config import SECRET_KEY
import bcrypt
import jwt
import datetime



def registrar_usuario(nombre, apellido, correo, contraseña, region_id):

    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)

    # Verificar si el correo ya existe
    cursor.execute(
        "SELECT id FROM usuario WHERE correo = %s",
        (correo,)
    )

    usuario = cursor.fetchone()

    if usuario:
        cursor.close()
        conexion.close()

        return {
            "success": False,
            "mensaje": "El correo ya está registrado."
        }

    # Encriptar contraseña
    contraseña_hash = bcrypt.hashpw(
        contraseña.encode("utf-8"),
        bcrypt.gensalt()
    )

    # Insertar usuario
    cursor.execute("""
        INSERT INTO usuario
        (nombre, apellido, correo, contrasena, region_id)
        VALUES (%s,%s,%s,%s,%s)
    """, (
        nombre,
        apellido,
        correo,
        contraseña_hash.decode("utf-8"),
        region_id
    ))

    conexion.commit()

    cursor.close()
    conexion.close()

    return {
        "success": True,
        "mensaje": "Usuario registrado correctamente."
    }

def iniciar_sesion(correo, contraseña):

    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM usuario
        WHERE correo = %s
    """, (correo,))

    usuario = cursor.fetchone()

    if not usuario:
        cursor.close()
        conexion.close()

        return {
            "success": False,
            "mensaje": "Correo o contraseña incorrectos."
        }

    contraseña_valida = bcrypt.checkpw(
        contraseña.encode("utf-8"),
        usuario["contrasena"].encode("utf-8")
    )

    if not contraseña_valida:

        cursor.close()
        conexion.close()

        return {
            "success": False,
            "mensaje": "Correo o contraseña incorrectos."
        }

    expiracion = datetime.datetime.utcnow() + datetime.timedelta(hours=2)

    token = jwt.encode(
        {
            "usuario_id": usuario["id"],
            "correo": usuario["correo"],
            "exp": expiracion
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    cursor.execute("""
        INSERT INTO sesion
        (usuario_id, token, expira_en)
        VALUES (%s,%s,%s)
    """, (
        usuario["id"],
        token,
        expiracion
    ))

    conexion.commit()

    cursor.close()
    conexion.close()

    return {
    "success": True,
    "mensaje": "Inicio de sesión exitoso.",
    "token": token,
    "usuario": {
        "id": usuario["id"],
        "nombre": usuario["nombre"],
        "apellido": usuario["apellido"],
        "correo": usuario["correo"],
        "region_id": usuario["region_id"]
    }
}

