from getpass import getpass
from werkzeug.security import generate_password_hash
from database import obtener_conexion

conexion = obtener_conexion()

try:
    with conexion.cursor() as cursor:
        for usuario, rol in [
            ("operador1", "operador"),
            ("tecnico1", "tecnico"),
        ]:
            cursor.execute(
                "SELECT id FROM usuarios WHERE usuario = %s",
                (usuario,),
            )

            if cursor.fetchone():
                print(f"{usuario} ya existe; no se modifica.")
                continue

            clave = getpass(f"Contraseña para {usuario}: ")
            confirmacion = getpass("Repetir contraseña: ")

            if not clave or clave != confirmacion:
                raise ValueError("Las contraseñas no coinciden o están vacías.")

            clave_hash = generate_password_hash(
                clave,
                method="pbkdf2:sha256:600000",
            )

            cursor.execute(
                """
                INSERT INTO usuarios (usuario, clave_hash, rol)
                VALUES (%s, %s, %s)
                """,
                (usuario, clave_hash, rol),
            )

    conexion.commit()
    print("Usuarios preparados correctamente.")

except Exception:
    conexion.rollback()
    raise

finally:
    conexion.close()