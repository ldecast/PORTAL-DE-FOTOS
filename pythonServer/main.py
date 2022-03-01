from curses import has_il
import json
import hashlib
from os import getuid
from site import addusersitepackages
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
from storage.dynamo_s3 import *

app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'seminario10'
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
CORS(app)
s3 = None
dynamo = None
#TODO tengo que quitar el app.debug para produccion


def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):
        rawdata = request.get_json()
        data = rawdata['data']
        token  = data['token']


        if not token:
            return jsonify({'message': 'token missing'}), 403

        data = jwt.decode(token,
                          app.config['SECRET_KEY'],
                          algorithms=['HS256'])
        return f(*args, **kwargs)

    return decorated


@app.route("/")
def home():
    return "Hello from flask server"


@app.route("/login", methods=['POST'])  #post
def login():
    if request.method == 'POST':
        rawdata = request.get_json()
        data = rawdata['data']
        uname = data['user']
        password = data['password']
        #consulta
        finalpass = hashlib.md5(password.encode())
        if login_user(uname, finalpass.hexdigest()):
            token = jwt.encode(
                {
                    'user': str(uname),
                    'exp':
                    datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
                }, app.config['SECRET_KEY'])
            return jsonify({'data': {'token': token.decode('utf-8')}, 'status': 200})
    return jsonify({'data': 'Credenciales invalidas', 'status': 401})


@app.route("/user", methods=['POST'])  #post, get y put
def user():
    if request.method == 'POST':
        rawdata = request.get_json()
        data = rawdata['data']
        uname = data['user']
        password = data['password']
        fullname = data['name']
        photo = data['photo']
        finalpass = hashlib.md5(password.encode())
        if add_user(uname, finalpass.hexdigest(), fullname, photo, uname):
            return jsonify({'data': "success", 'status': 200})
        return jsonify({'data': 'failed at create user', 'status': 401})
    return "pagina user"

@app.route("/user",methods=['GET','PUT'])
@token_required
def selfuser():
    if request.method == 'GET':
        rawdata = request.get_json()
        data = rawdata['data']
        token  = data['token']
        data = jwt.decode(token,
                          app.config['SECRET_KEY'],
                          algorithms=['HS256'])
        usuario= get_user(data["user"])
        retornoAux =[]
        for element in usuario.photos:
            retornoAux.append(element.__dict__)
        retorno = usuario
        retorno.photos = retornoAux
        return json.dumps(retorno.__dict__)
    elif request.method == 'PUT':
        rawdata = request.get_json()
        data = rawdata['data']
        token = data['token']
        newuser=data['user']
        password = data['password']
        fullname = data['name']
        data = jwt.decode(token, app.config['SECRET_KEY'],algorithms=['HS256'])
        confirm = updateUser(data['user'],password,newuser,fullname)
        if confirm:
            return jsonify({'data':'success', 'status':200})
    return jsonify({'data':'error failed to get or put', 'status':401})


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
    s3 = connectBucketS3()
    dynamo = connectDynamoDB()
    print(s3)
    print(dynamo)
    app.run()