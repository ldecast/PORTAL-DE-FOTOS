import json
from flask import Flask, jsonify, request, make_response
import jwt
import datetime
from functools import wraps

app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'seminario10'
#TODO tengo que quitar el app.debug para produccion


def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.args.get('token')

        if not token:
            return jsonify({'message': 'token missing'}), 403

        data = jwt.decode(token, app.config['SECRET_KEY'],algorithms=['HS256'])
        return f(*args, **kwargs)
    return decorated


@app.route("/")
def home():
    return "Hello from flask server"


@app.route("/login")  #post
def login():
    uname = "usuario"
    password = "pass"
    if uname == "usuario" and password == "pass":
        token = jwt.encode(
            {
                'user': uname,
                'exp':
                datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
            }, app.config['SECRET_KEY'])
        return jsonify({'token': token})

    return 'pagina login'


@app.route("/user")  #post, get y put
@token_required
def user():
    return "pagina user"


@app.route("/photo")  #post
def photo():
    auth = request.authorization

    if auth and auth.password == 'password':  #tengo que cambiar el string por algo correcto
        return ''

    return make_response('not verifyed', 401,
                         {'WWW-Authenticate': 'Login Required'})


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