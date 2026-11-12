
from flask import Flask, render_template, request, redirect, url_for

app = Flask(
    __name__,
    template_folder="views",
    static_folder="public",
    static_url_path="/public"
)

@app.route("/")
def inicio():
    return redirect(url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        usuario = request.form.get("usuario")
        clave = request.form.get("clave")

        print("Usuario ingresado:", usuario)
        print("Clave ingresada:", clave)

    return render_template("login.html")

if __name__ == "__main__":
    app.run(debug=True)
