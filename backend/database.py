import os
import pymysql


def obtener_conexion():
    return pymysql.connect(
        host="127.0.0.1",
        port=3306,
        user="mesa_app",
        password=os.environ["DB_PASSWORD"],
        database="mesaayuda",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=5,
    )


if __name__ == "__main__":
    conexion = obtener_conexion()

    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT DATABASE() AS nombre")
            resultado = cursor.fetchone()
            print("Conexion correcta a:", resultado["nombre"])
    finally:
        conexion.close()