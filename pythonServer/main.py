from crypt import methods
from curses import has_il
import json
import hashlib
from lib2to3.pgen2.tokenize import TokenError
from os import getuid
from secrets import token_bytes
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
        token = data['token']

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


@app.route("/login", methods=['POST'])
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
                    'user':
                    str(uname),
                    'exp':
                    datetime.datetime.utcnow() + datetime.timedelta(minutes=40)
                }, app.config['SECRET_KEY'])
            return jsonify({
                'data': {
                    'token': token.decode('utf-8')
                },
                'status': 200
            })
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


@app.route("/user", methods=['GET', 'PUT'])
@token_required
def selfuser():
    if request.method == 'GET':
        rawdata = request.get_json()
        data = rawdata['data']
        token = data['token']
        data = jwt.decode(token,
                          app.config['SECRET_KEY'],
                          algorithms=['HS256'])
        usuario = get_user(data["user"])
        usuario['password'] = ''
        retornoAux = []
        for element in usuario.photos:
            retornoAux.append(element.__dict__)
        retorno = usuario
        retorno.photos = retornoAux
        return (retorno.__dict__)
    elif request.method == 'PUT':
        rawdata = request.get_json()
        data = rawdata['data']
        token = data['token']
        newuser = data['user']
        password = data['password']
        fullname = data['name']
        data = jwt.decode(token,
                          app.config['SECRET_KEY'],
                          algorithms=['HS256'])
        confirm = updateUser(data['user'], password, newuser, fullname)
        if confirm:
            return jsonify({'data': 'success', 'status': 200})
    return jsonify({'data': 'error failed to get or put', 'status': 401})


@app.route("/photo", methods=['POST', 'DELETE'])  #post
@token_required
def photo():
    if request.method == 'POST':
        rawdata = request.get_json()
        data = rawdata['data']
        token = data['token']
        tokendecode = jwt.decode(token,
                                 app.config['SECRET_KEY'],
                                 algorithms=['HS256'])
        photo = data['photo']
        confirmation = uploadPhoto(tokendecode['user'], photo['album'],
                                   photo['photo'], photo['name'])
        if confirmation:
            return jsonify({
                'data': 'photo uploaded successfully',
                'status': 200
            })
        return jsonify({'data': 'error failed to upload photo', 'status': 401})
    if request.method == 'DELETE':
        rawdata = request.get_json()
        data = rawdata['data']
        token = data['token']
        tokendecode = jwt.decode(token,
                                 app.config['SECRET_KEY'],
                                 algorithms=['HS256'])
        confirmation = deletePhoto(tokendecode['user'],photo['url'])
        if confirmation:
            return jsonify({
                'data': 'photo deleted successfully',
                'status': 200
            })
        return jsonify({'data': 'error failde to deleted photo','status':401})
    return jsonify({'data': 'error failed to post or delete', 'status': 401})


@app.route("/album",methods=['GET'])  #get
@token_required
def album():
    rawdata = request.get_json()
    data = rawdata['data']
    token = data['token']
    data = jwt.decode(token,
                        app.config['SECRET_KEY'],
                        algorithms=['HS256'])
    usuario = get_user(data["user"])
    retornoAux = []
    albums = []
    for element in usuario.photos:
        retornoAux.append(element.__dict__)
    for element in retornoAux:
        albums.append(element["albumName"])
    return json.dumps(albums)


@app.route("/album/<name>")  #delete
@token_required
def albumId(name):
    rawdata=request.get_json()
    data = rawdata['data']
    token = data['token']
    decodetoken = jwt.decode(token,app.config['SECRET_KEY'],algorithms=['HS256'])
    confirmation =deleteAlbum(decodetoken['user'],name)
    if confirmation :
        return jsonify({'data':'success','status':200})
    return jsonify({'data':'error deleting album','status':403})


if __name__ == "__main__":
    s3 = connectBucketS3()
    dynamo = connectDynamoDB()
    print(s3)
    print(dynamo)
    app.run()
