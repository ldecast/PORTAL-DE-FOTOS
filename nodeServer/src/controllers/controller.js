const md5 = require('md5');
const jwt = require('jsonwebtoken')
const webServerConfig = require('../config/webserver.config');
const DynamoDB = require('../services/nodejs/dynamo_s3')
const din = require('../services/dynamodb')


function verificar(token) {
    if (!token) {
        return false
    }
    try {
        const decode = jwt.verify(token, webServerConfig.secret);
        return decode
    } catch (err) {
      return false
    }
}
// Hola mundo 
module.exports.holaMundo = async function (request, response, next) {
    try {
        var token = request.body.data.token || false
        if (!verificar(token)) {
            return response.status(401).json({data:'Necesita token de acceso',status: 401});
        }
        return response.status(200).json({
            mensaje: 'token valido'
        })
    } catch (error) {
        console.log(error)
        response.status(404).json({
            mensaje: 'hubo pedo'
        })
    }
}

// LOGIN POST Endpoint para el inicio de sesión.
module.exports.login = async function (request, response) {
    try {
        var encriptPass = md5(request.body.data.password)
        var user = {user: request.body.data.user}
        if (!user) response.status(400).json({data:'No envio todas las credenciales',status: 400})
        if (!request.body.data.password) response.status(400).json({data:'No envio todas las credenciales',status: 400})
        let resultado = await DynamoDB.Login(user.user,encriptPass)
        if (resultado==true) {
            const token = jwt.sign(user,webServerConfig.secret,{expiresIn:"30m"})
            return response.status(200).json({data:token,status: 200})
        }
        return response.status(401).json(resultado)
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
        var token = request.body.data.token || false
        var decodificado = verificar(token)
        if (!decodificado) return response.status(401).json({data:'Necesita token de acceso',status: 401});
        if (!decodificado.user) return response.status(400).json({data:'User no enviado',status: 400});
        var usuario = decodificado.user
        var resultado = await DynamoDB.getUsuario(usuario)
        if (resultado.status!=200) return response.status(400).json({data:resultado.data,status: 400})
        response.status(200).json(resultado)
    } catch (error) {
        //console.log(error)
        return response.status(400).json({data:'Error inesperado',status: 400});
    }
}
//POST USER Endpoint para registrar un usuario.
module.exports.addUser = async function (request, response, next) {
    try {
        var usuario=request.body.data
        if (!usuario.name || !usuario.user || !usuario.password || !usuario.photo) {
            return response.status(400).json({data:'Faltan parametros',status: 400});
        }
        var encriptPass = md5(request.body.data.password)

        var res = await DynamoDB.add_user(usuario.user,encriptPass,usuario.name,usuario.photo,usuario.user)
        if(res==true) return response.status(200).json({data:'Ingresado con exito',status: 200});
        else return response.status(400).json(res)
    } catch (error) {
        //console.log(error)
        return response.status(400).json({data:'Error inesperado',status: 400});
    }
}
// PUT USER Endpoint para actualizar un usuario.
module.exports.updateUser = async function (request, response, next) {
    try {
        var token = request.body.data.token || false
        var usuario=request.body.data
        var encriptPass = md5(request.body.data.password)

        var decodificado = verificar(token)
        if (!decodificado) return response.status(401).json({data:'Necesita token de acceso',status: 401});
        if (!usuario.name || !usuario.user || !usuario.password) {
            return response.status(400).json({data:'Faltan parametros',status: 400});
        }
        var result = await DynamoDB.updateUser(decodificado.user,usuario.user,encriptPass,usuario.name)
        if (result==true) return response.status(200).json({data:'Actualizacion exitosa',status: 200})
        return response.status(400).json(result)
    } catch (error) {
        console.log(error)
        return response.status(400).json({data:'Error inesperado',status: 400});
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

module.exports.deleteUser = async function (request, response, next) {
    try {
        if (!request.body.data.password) return response.status(401).json({data:'Necesita pass para confirmacion',status: 401});
        
        var token = request.body.data.token || false
        var decodificado = verificar(token)
        if (!decodificado) return response.status(401).json({data:'Necesita token de acceso',status: 401});

        var res = await DynamoDB.deleteUser(decodificado.user,md5(request.body.data.password))
        return response.json(res)
    } catch (error) {
        response.status(404).json({
            mensaje: 'hubo pedo'
        })
    }
}

// module.exports.pruebas = async function (request, response, next) {
//     try {
//         console.log(await din.Login("rojascjp","rojascjp"))
//         response.status(200).json({
//             mensaje: 'hola joto'
//         })
//     } catch (error) {
//         response.status(404).json({
//             mensaje: 'hubo pedo'
//         })
//     }
// }
