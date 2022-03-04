const md5 = require('md5');
const jwt = require('jsonwebtoken')
const webServerConfig = require('../config/webserver.config');
const DynamoDB = require('../services/nodejs/dynamo_s3')


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
module.exports.holaMundo = async function (request, response) {
    console.log('aca')
    response.status(200).json({
        mensaje: 'token valido'
    })

}

//POST USER Endpoint para registrar un usuario.
module.exports.addUser = async function (request, response, next) {
    try {
        var usuario=request.body.data
        if (!usuario.name || !usuario.user || !usuario.password) {
            return response.status(400).json({data:'Faltan parametros',status: 400});
        }
        var encriptPass = md5(request.body.data.password)

        var res = await DynamoDB.add_user(usuario.user,encriptPass,usuario.name,usuario.photo,usuario.user)
        if(res.status==200) return response.status(200).json({data:'Ingresado con exito',status: 200});
        else return response.status(400).json(res)
    } catch (error) {
        //console.log(error)
        return response.status(400).json({data:'Error inesperado',status: 400});
    }
}

// LOGIN POST Endpoint para el inicio de sesión.
module.exports.login = async function (request, response) {
    try {
        var usuario=request.body.data
        if (!usuario.user || !usuario.password ) {
            return response.status(400).json({data:'Faltan parametros',status: 400});
        }
        var user = {user: usuario.user}
        let resultado = await DynamoDB.login(user.user,md5(usuario.password))
        if (resultado==true) {
            const token = jwt.sign(user,webServerConfig.secret,{expiresIn:"30m"})
            response.setHeader("X-Access-Token",token)
            return response.status(200).json({data:"Login exitoso",status: 200})
        }
        return response.status(401).json(resultado)
    } catch (error) {
        console.log(error)
        response.status(400).json({error: 'Ocurrio un error en el login',status:400})
    }
}
//GET USSER Endpoint para obtener la información del usuario.
module.exports.getUser = async function (request, response, next) {
    try {
        var resultado = await DynamoDB.get_user(request.token.user,false)
        // regresando lo que sea error
        if (resultado.status!=200) return response.status(400).json({data:resultado.data,status: 400})
        // regresando datos como pide el front
        response.status(200).json({data:resultado.data,status:200})
    } catch (error) {
        //console.log(error)
        return response.status(400).json({data:'Error inesperado',status: 400});
    }
}
// PUT USER Endpoint para actualizar un usuario.
module.exports.updateUser = async function (request, response, next) {
    try {
        let decodificado=request.token
        var usuario = request.body.data
        if (!usuario.password) {
            return response.status(400).json({data:'Necesita enviar clave para actualizar',status: 400});
        }
        var encriptPass = md5(usuario.password)
        var result
        // si no envia username es porque solo quiere actualizar el nombre
        // COMPROBAR QUE NO EXISTA EL USER A CAMBIAR
        if (usuario.user) {
            var comprovarUser = await DynamoDB.get_user(usuario.user,false)
            if (comprovarUser.status==200) {
                return response.status(400).json({data:'El username ya existe',status:400})
            }
        }
        if(!usuario.user && usuario.name){
            result = await DynamoDB.updateUser(decodificado.user,encriptPass,'',usuario.name)
        } 
        else if (usuario.user && !usuario.name) {
            result = await DynamoDB.updateUser(decodificado.user,encriptPass,usuario.user,'')
        }
        else if (usuario.user) {
            result = await DynamoDB.updateUser(decodificado.user,encriptPass,usuario.user,usuario.name)
        }
        else return response.status(400).json({data:'No envio parametro a actualizar',status:400})
        if (result.status==200) return response.status(200).json({data:'Usuario actualizado con exito',status:200})
        return response.status(400).json({data:'Ocurrio un error',status:400})
    } catch (error) {
        console.log(error)
        return response.status(400).json({data:'Error inesperado',status: 400});
    }
}
// POST PHOTO Endpoint para subir una foto.
module.exports.uploadPhoto  = async function (request, response) {
    try {
        var data=request.body.data.photo
        var foto ={
            url: '',
            photo: data.photo,
            album: data.album,
            name: data.name,
          }
        var decodificado = request.token
        var result=true
        var result = await DynamoDB.uploadPhoto(decodificado.user,foto.album,foto.photo,foto.name)
        if (result==true) return response.status(200).json({data:'Foto subida con exito',status: 200});
        return response.status(400).json({data:'No se subio la foto',status: 400});
    } catch (error) {
        return response.status(400).json({data:'Error inesperado',status: 400});
    }
}
// PUT PHOTO Endpoint para actualizar una foto.
module.exports.updatePhoto = async function (request, response, next) {
    try {
        var token = request.body.data.token || false
        var decodificado = verificar(token)
        if (!decodificado) return response.status(401).json({data:'Necesita token de acceso',status: 401});
        if(!request.body.data.url) return response.status(400).json({data:'Necesita enviar la url',status: 400});
        if(!request.body.data.photo) return response.status(400).json({data:'Necesita enviar nueva foto',status: 400});
        var result = await DynamoDB.updateProfilePhoto(decodificado.user,request.body.data.photo,decodificado.user)
        if (result==true) return response.status(200).json({data:'Foto actualizada con exito',status: 200});
        return response.status(400).json({data:'No se pudo actualizar la foto',status: 400});
    } catch (error) {
        return response.status(400).json({data:'Error inesperado',status: 400});
    }
}
// DELETE PHOTO Endpoint para eliminar una foto.
module.exports.deletePhoto = async function (request, response, next) {
    try {
        var decodificado = request.token
        var url = request.body.data.url
        if(!request.body.data.url) return response.status(401).json({data:'Necesita enviar la url',status: 401});
        var result = await DynamoDB.deletePhoto(decodificado.user,url)
        if (result==true) return response.status(200).json({data:'Foto eliminada con exito',status: 200});
        return response.status(400).json({data:'No se eliminar la foto',status: 400});
    } catch (error) {
        //console.log(error)
        return response.status(400).json({data:'Error inesperado',status: 400});
    }
}
// GET ALBUM Endpoint para obtener los álbumes del usuario.
module.exports.getAlbum = async function (request, response, next) {
    try {
        var token = request.body.data.token || false
        var decodificado = verificar(token)
        if (!decodificado) return response.status(401).json({data:'Necesita token de acceso',status: 401});
        if(!request.body.data.album) return response.status(401).json({data:'Necesita enviar la album',status: 401});

        var result = await DynamoDB.getAlbum(decodificado.user,request.body.data.album)

        if (result.data) return response.status(200).json({data:result.data,status: 200});
        return response.status(400).json({data:'No se pudo obtener el album',status: 400});
    } catch (error) {
        //console.log(error)
        return response.status(400).json({data:'Error inesperado',status: 400});
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
        
        var decodificado = request.token

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
