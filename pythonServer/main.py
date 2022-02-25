from flask import Flask, redirect, url_for
from flask_jwt import JWT, jwt_required, current_identity
from werkzeug.security import safe_str_cmp


class User(object):

    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password

    def __str__(self):
        return "User(id='%s')" % self.id


users = [User(1, 'user1', 'user1pass'), User(2, 'user2', 'user2pass')]

username_table = {u.username: u for u in users}
userid_table = {u.id: u for u in users}


def authenticate(username, password: str):
    user = username_table.get(username, None)
    if user and safe_str_cmp(user.password.encode('utf-8'),
                             password.encode('utf-8')):
        return user


def identity(payload):
    user_id = payload['identity']
    return userid_table.get(user_id, None)


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
    return "pagina photo " + id


@app.route("/album")  #get
def album():
    return "pagina album"


@app.route("/album/<id>")  #delete
def albumId(id):
    return "pagina album " + id


if __name__ == "__main__":
    app.run()