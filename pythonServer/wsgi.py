from crypt import methods
from curses import has_il
import json
import hashlib
from lib2to3.pgen2.tokenize import TokenError
import math
from os import getuid
from random import random
from secrets import token_bytes
from site import addusersitepackages
from flask import Flask, jsonify, request,make_response
from flask_cors import CORS 
from random import random
import jwt
import datetime
from functools import wraps
from storage.dynamo_s3 import *

app = Flask(__name__)
app.config['SECRET_KEY'] = 'seminario10'
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
CORS(app)
s3 = None
dynamo = None
# TODO tengo que quitar el app.debug para produccion

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
        photo = data['photo']
        #consulta
        finalpass = hashlib.md5(password.encode())
        token = jwt.encode(
            {
                'user':
                str(uname),
                'exp':
                datetime.datetime.utcnow() + datetime.timedelta(minutes=40)
            }, app.config['SECRET_KEY'])
        if password != "" :
            print("login por pass")
            if login_user(uname, finalpass.hexdigest()):
                return jsonify({'data': {"token":token.decode('utf-8')}, 'status': 200})
        elif Compare(uname,photo):
            print("login por foto")
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
        for element in usuario.getPhotos():
            cadenaComparacion = str(element.url).split(sep='/')
            if len(cadenaComparacion)==3:
                element.album = 'Fotos_Perfil'
            else:
                element.album = cadenaComparacion[-2]
            element.name = cadenaComparacion[-1]
            del(element.username)
            if element.album == 'actual':
                element.album = "Fotos_Perfil"
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
            auxiliar  = get_user(tokendecode['user'])

            updateProfilePhoto(tokendecode['user'],photo['photo'],str(int(random()*10000)))
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

@app.route("/translate",methods=['POST'])
# @token_required
def translate():
    rawdata = request.get_json()
    data = rawdata['data']
    text = data['text']
    destination = data["language"]

    res = translateT(text,destination)
    if res is None:
        return jsonify({'data': 'Ocurrio un error al traducir', 'status': 401})
    return jsonify({'data': {"text":res}, 'status': 200})

if __name__=='__main__':
    from waitress import serve
    conection = connect_AWS_Services()
    print(conection)
    serve(app,port=5000)
