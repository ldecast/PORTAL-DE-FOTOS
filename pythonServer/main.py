from crypt import methods
from curses import has_il
import json
import hashlib
from lib2to3.pgen2.tokenize import TokenError
from os import getuid
from secrets import token_bytes
from site import addusersitepackages
from flask import Flask, jsonify, request,make_response
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
        token = request.headers.get("X-Access-Token")
        if not token:
            return jsonify({'message': 'token missing'}), 403
        data = jwt.decode(token,app.config['SECRET_KEY'],algorithms=['HS256'])
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
            return jsonify({'data': {"token":token.decode('utf-8')}, 'status': 200})
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
        token = request.headers.get("X-Access-Token")
        data = jwt.decode(token,
                          app.config['SECRET_KEY'],
                          algorithms=['HS256'])
        usuario = get_user(data["user"])
        retornoAux = []
        for element in usuario.photos:
            cadenaComparacion = str(element.url).split(sep='/')
            if len(cadenaComparacion)==3:
                element.album = 'Fotos_Perfil'
            else:
                element.album = cadenaComparacion[-2]
            element.name = cadenaComparacion[-1]
            del(element.username)
            retornoAux.append(element.__dict__)
        retorno = usuario
        retorno.name = usuario.fullname
        retorno.user = usuario.username
        del(retorno.username)
        del(retorno.fullname)
        retorno.photos = retornoAux
        retorno.password = ''
        for photo in retornoAux:
            cadenaComparacion = str(photo['url']).split(sep='/')
            if len(cadenaComparacion) > 2:
                if cadenaComparacion[2] == 'actual':
                    retorno.photo = photo
        res = jsonify({'data':retorno.__dict__,'status':200})
        return res
    elif request.method == 'PUT':
        rawdata = request.get_json()
        data = rawdata['data']
        token = request.headers.get("X-Access-Token")
        newuser = data['user']
        photo = data['photo']
        password = data['password']
        fullname = data['name']
        tokendecode = jwt.decode(token,
                          app.config['SECRET_KEY'],
                          algorithms=['HS256'])
        passcoded = hashlib.md5(password.encode())
        if fullname == '':
            fullname = ''
        if newuser == '':
            newuser = ''
        if tokendecode['user'] == newuser:
            newuser = ''
        if photo != None and photo != '':
            updateProfilePhoto(tokendecode['user'],photo['photo'],photo['name'])
            print(photo['photo'])
            print(photo['name'])
            print(tokendecode['user'])
        confirm = updateUser(tokendecode['user'], passcoded.hexdigest(), newuser,
                             fullname)
        if confirm:
            return jsonify({'data': 'success', 'status': 200})
    return jsonify({'data': 'error failed to get or put', 'status': 401})


@app.route("/photo", methods=['POST', 'DELETE','PUT'])  #post
@token_required
def photo():
    if request.method == 'POST':
        rawdata = request.get_json()
        data = rawdata['data']
        token = request.headers.get("X-Access-Token")
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
    elif request.method == 'DELETE':
        rawdata = request.get_json()
        data = rawdata['data']
        photo = data['photo']
        token = request.headers.get("X-Access-Token")
        tokendecode = jwt.decode(token,
                                 app.config['SECRET_KEY'],
                                 algorithms=['HS256'])
        confirmation = deletePhoto(tokendecode['user'], photo['url'])
        if confirmation:
            return jsonify({
                'data': 'photo deleted successfully',
                'status': 200
            })
        return jsonify({
            'data': 'error failde to deleted photo',
            'status': 401
        })
    elif request.method == 'PUT':
        rawdata = request.get_json()
        data = rawdata['data']
        photo = data['photo']
        token = request.headers.get('X-Access-Token')
        tokendecode = jwt.decode(token,
                                 app.config['SECRET_KEY'],
                                 algorithms=['HS256'])
        confirmation = updatePhoto(photo['url'],photo['album'],photo['name'],tokendecode['user'])
        if confirmation:
            return jsonify({
                'data': 'photo deleted successfully',
                'status': 200
            })
        return jsonify({
            'data': 'error failde to deleted photo',
            'status': 401
        })
    return jsonify({'data': 'error failed to post, put or delete', 'status': 401})

@app.route("/album", methods=['GET'])  #get
@token_required
def album():
    token = request.headers.get("X-Access-Token")
    data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    usuario = get_user(data["user"])
    retornoAux = []
    albums = []
    for element in usuario.photos:
        retornoAux.append(element.__dict__)
    for element in retornoAux:
        if element['album'] not in albums:
            albums.append(element["album"])
    return jsonify({'data':albums,'status':200})


@app.route("/album/<name>", methods=['DELETE', 'GET'])  #delete
@token_required
def albumId(name):
    if request.method == "DELETE":
        token = request.headers.get("X-Access-Token")
        decodetoken = jwt.decode(token,
                                app.config['SECRET_KEY'],
                                algorithms=['HS256'])
        confirmation = deleteAlbum(decodetoken['user'], name)
        if confirmation:
            return jsonify({'data': 'success', 'status': 200})
        return jsonify({'data': 'error deleting album', 'status': 403})
    elif request.method == "GET":
        token = request.headers.get("X-Access-Token")
        data = jwt.decode(token,
                          app.config['SECRET_KEY'],
                          algorithms=['HS256'])
        usuario = get_user(data["user"])
        photos = usuario.photos
        retorno = []
        for element in photos:
            if element.album == name:
                del(element.username)
                nombre = str(element.url,).split(sep='/')
                element.name = nombre[-1]
                retorno.append(element.__dict__)
        return jsonify({'data':retorno,'status':200})

    return jsonify({'data':'erro at DELETE or GET', 'status':403})


if __name__ == "__main__":
    s3 = connectBucketS3()
    dynamo = connectDynamoDB()
    print(s3)
    print(dynamo)
    app.run(port=5000)
