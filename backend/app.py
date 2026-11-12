from pathlib import Path
from flask import Flask, render_template

BASE_DIR = Path(__file__).resolve().parent.parent

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "frontend" / "templates"),
    static_folder=str(BASE_DIR / "frontend" / "static"),
)


@app.route("/")
def login():
    return render_template("login.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)