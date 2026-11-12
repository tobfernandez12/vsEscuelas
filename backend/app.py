import os
from pathlib import Path
from flask import (
    Flask, render_template, request,
    redirect, url_for, session, abort,
)
from werkzeug.security import check_password_hash
from database import obtener_conexion

BASE_DIR = Path(__file__).resolve().parent.parent

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "frontend" / "templates"),
    static_folder=str(BASE_DIR / "frontend" / "static"),
    static_url_path="/static",
)

app.config.update(
    SECRET_KEY=os.environ["SECRET_KEY"],
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)


@app.before_request
def exigir_sesion():
    if request.endpoint in ("login", "static"):
        return

    if "usuario_id" not in session:
        return redirect(url_for("login"))


@app.route("/")
def inicio():
    destino = "admin" if session.get("rol") == "tecnico" else "operador"
    return redirect(url_for(destino))


@app.route("/login", methods=["GET", "POST"])
def login():
    error = None

    if request.method == "POST":
        usuario = request.form.get("usuario", "").strip()
        clave = request.form.get("clave", "")

        conexion = obtener_conexion()
        try:
            with conexion.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, usuario, clave_hash, rol
                    FROM usuarios
                    WHERE usuario = %s
                    """,
                    (usuario,),
                )
                cuenta = cursor.fetchone()
        finally:
            conexion.close()

        if cuenta and check_password_hash(cuenta["clave_hash"], clave):
            session.clear()
            session["usuario_id"] = cuenta["id"]
            session["usuario"] = cuenta["usuario"]
            session["rol"] = cuenta["rol"]
            return redirect(url_for("inicio"))

        error = "Usuario o clave incorrectos"

    return render_template("login.html", error=error)


@app.route("/operador")
def operador():
    return render_template("usuario.html")


@app.route("/admin")
def admin():
    if session.get("rol") != "tecnico":
        abort(403)

    return render_template("administrador.html")


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)