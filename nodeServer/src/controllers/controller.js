const md5 = require('md5');
const jwt = require('jsonwebtoken')
const webServerConfig = require('../config/webserver.config');
const DynamoDB = require('../services/dynamodb')


// Hola mundo 
module.exports.holaMundo = async function (request, response, next) {
    try {
        response.status(200).json({
            mensaje: 'hola joto'
        })
    } catch (error) {
        response.status(404).json({
            mensaje: 'hubo pedo'
        })
    }
}

// LOGIN POST Endpoint para el inicio de sesión.
module.exports.login = async function (request, response) {
    try {
        // encriptar la pass antes de comparar
        var encriptPass = md5(request.body.data.password)
        var user = {user: request.body.data.user}

        let resultado = await DynamoDB.Login(user.user, request.body.data.password)
        if (resultado) {
            const token = jwt.sign(user,webServerConfig.secret,{expiresIn:10})
            response.status(200).json({data:token,status: 200})
            return
        }
        response.status(401).json({data:'Credenciales de usuario incorrectas',status: 401})
    } catch (error) {
        response.status(404).json({
            error: 'Ocurrio un error en el login',
            status:404
        })
    }
}
//GET USSER Endpoint para obtener la información del usuario.
module.exports.getUser = async function (request, response, next) {
    try {
        response.status(200).json({
            mensaje: 'hola joto'
        })
    } catch (error) {
        response.status(404).json({
            mensaje: 'hubo pedo'
        })
    }
}
//POST USER Endpoint para registrar un usuario.
module.exports.addUser = async function (request, response, next) {
    try {
        var prePass = request.body.data.password
        var encriptPass = md5(prePass)
        // verificar la existencia del usuario en la db
        // metodo(request.body.data.user)
        response.status(200).json({
            mensaje: 'hola joto',
            pass: encriptPass
        })
    } catch (error) {
        response.status(404).json({
            mensaje: 'hubo pedo'
        })
    }
}
// PUT USER Endpoint para actualizar un usuario.
module.exports.updateUser = async function (request, response, next) {
    try {
        response.status(200).json({
            mensaje: 'hola joto'
        })
    } catch (error) {
        response.status(404).json({
            mensaje: 'hubo pedo'
        })
    }
}
// POST PHOTO Endpoint para subir una foto.
module.exports.uploadPhoto  = async function (request, response, next) {
    try {
        response.status(200).json({
            mensaje: 'hola joto'
        })
    } catch (error) {
        console.log(error)
        response.status(404).json({
            mensaje: 'hubo pedo'
        })
    }
}
// PUT PHOTO Endpoint para actualizar una foto.
module.exports.updatePhoto = async function (request, response, next) {
    try {
        response.status(200).json({
            mensaje: 'hola joto'
        })
    } catch (error) {
        console.log(error)
        response.status(404).json({
            mensaje: 'hubo pedo'
        })
    }
}
// DELETE PHOTO Endpoint para eliminar una foto.
module.exports.deletePhoto = async function (request, response, next) {
    try {
        response.status(200).json({
            mensaje: 'hola joto'
        })
    } catch (error) {
        response.status(404).json({
            mensaje: 'hubo pedo'
        })
    }
}
// GET ALBUM Endpoint para obtener los álbumes del usuario.
module.exports.getAlbum = async function (request, response, next) {
    try {
        response.status(200).json({
            mensaje: 'hola joto'
        })
    } catch (error) {
        response.status(404).json({
            mensaje: 'hubo pedo'
        })
    }
}
// DELETE ALBUM Endpoint para eliminar un álbum.
module.exports.deleteAlbum = async function (request, response, next) {
    try {
        response.status(200).json({
            mensaje: 'hola joto'
        })
    } catch (error) {
        response.status(404).json({
            mensaje: 'hubo pedo'
        })
    }
}