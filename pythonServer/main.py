from flask import Flask, redirect, url_for

app = Flask(__name__)
app.debug = True
#TODO tengo que quitar el app.debug para produccion


@app.route("/")
def home():
    return "Hello from flask server"


@app.route("/login")  #post
def login():
    return "pagina login"


@app.route("/user")  #post, get y put
def user():
    return "pagina user"


@app.route("/photo")  #post
def photo():
    return "pagina photo"


@app.route("/photo/<id>")  #put y delete
def photoId(id):
    return "pagina photo "+id


@app.route("/album")  #get
def album():
    return "pagina album"


@app.route("/album/<id>")  #delete
def albumId(id):
    return "pagina album "+ id


if __name__ == "__main__":
    app.run()