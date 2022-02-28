const crypto = require("crypto");
const webServerConfig = require('../config/webserver.config');


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
        response.status(200).json({
            mensaje: 'hola'
        })
    } catch (error) {
        response.status(404).json({
            mensaje: 'hubo pedo'
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
        console.log(prePass)
        const hasher = crypto.createHmac("sha256",webServerConfig.secret)
        console.log(hasher.update(prePass).digest("base64"))
        response.status(200).json({
            mensaje: 'hola joto'
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