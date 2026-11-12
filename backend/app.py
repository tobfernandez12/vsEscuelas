from pathlib import Path
from flask import Flask, render_template, request, redirect, url_for

BASE_DIR = Path(__file__).resolve().parent.parent

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "frontend" / "templates"),
    static_folder=str(BASE_DIR / "frontend" / "static"),
    static_url_path="/static",
)


@app.route("/")
def inicio():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # Falta implementar la validación contra MariaDB.
        return render_template("login.html", error="El inicio de sesión todavía está en configuración.", ), 503

    return render_template("login.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)