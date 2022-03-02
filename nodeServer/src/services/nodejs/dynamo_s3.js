var AWS = require("aws-sdk");
const dotenv = require('dotenv');
const { resolve } = require("path");
const UserDB = require("./objects/user");
dotenv.config();

/* Configurando credenciales */
AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION_NAME,
});

/* Clientes de AWS */
var client_dynamodb = new AWS.DynamoDB.DocumentClient();
var client_s3 = new AWS.S3();

/* Metadata */
const table_users = {
    Name: 'Users',
    Attributes: ['Username', 'Password', 'FullName']
}
const table_photos = {
    Name: 'Photos',
    Attributes: ['PhotoURL', 'AlbumName', 'Username']
}
const bucket_name = "imagenes.semi1"

function returnErr(error) {
    console.log(error);
    return false;
}

/* REGISTRAR UN USUARIO */
module.exports.add_user = function add_user(username, password, fullname, base64_photo, filename_photo) {
    return new Promise((resolve, reject) => {
        try {
            // Verificar que no exista el usuario
        return client_dynamodb.get(
            { TableName: table_users.Name, Key: { 'Username': username } },
            (err, data) => {
                if (err) return resolve({data:'Error al hacer consulta dynamodb',status:400});
                if (data.Item) return resolve({data:'User already exists',status:400})
                // Creación de parámetros
                const item_users = {
                    Username: username,
                    Password: password,
                    FullName: fullname
                }
                const url = "Fotos_Perfil/" + username + "/actual/" + filename_photo
                const item_photos = {
                    PhotoURL: url,
                    AlbumName: "Fotos de Perfil",
                    Username: username
                }
                console.log("Adding user:", item_users);
                // Insertar usuario
                return client_dynamodb.put({
                    TableName: table_users.Name, Item: item_users
                }, function (err) {
                    if (!err) {
                        if (base64_photo && filename_photo) {
                            // Guardar la foto en bucket S3
                            let b64_decode = new Buffer.from(base64_photo, 'base64');
                            const params = {
                                Bucket: bucket_name,
                                Key: url,
                                Body: b64_decode,
                                ContentType: "image"
                            };
                            return client_s3.putObject(params, function (err) {
                                if (!err) {
                                    // Insertar ruta en Dynamo
                                    return client_dynamodb.put({
                                        TableName: table_photos.Name, Item: item_photos
                                    }, (err) => {
                                        if (!err) {
                                            console.log("User added correctly");
                                            return resolve(true);
                                        }
                                    });
                                }
                                else {
                                    // borar usuario
                                    return resolve({data:'Error al ingresar al bucket',status:400});}
                            });
                        }
                    } else return resolve({data:'Error al crear el usuario',status:400});
                });
            });
        } catch (error) {
            console.log(error)
                return resolve({data:'Ocurrio un error al obtener el usuario',status:400})
        }
    })
}

/* VERIFICAR LOGIN */
module.exports.Login = function login_user(username, password) {
    return new Promise((resolve,reject) => {
        const key = { 'Username': username };
    return client_dynamodb.get({ TableName: table_users.Name, Key: key },
        function (err, user) {
            if (err) {return resolve({data:'Error en consulta a dynamo',status:400})}
            if (!user.Item) {return resolve({data:"The user doesn't exists",status:400})}
            password_db = user.Item.Password;
            if (password_db == password) { // Ambas password deben estar en md5
                console.log("Login is correct");
                resolve(true)
                return;
            }
            else {
                 return resolve({data:"The password is incorrect",status:400})
            }
        });
    })
}

/* OBTENER TODA LA DATA DE UN USUARIO */
module.exports.GetUser = function get_user(__username) {
    try {
        const key = { 'Username': __username };
    // Obtener el usuario
    return client_dynamodb.get({ TableName: table_users.Name, Key: key },
        function (err, user_db) {
            try {
                console.log(__username)
                if (err) return returnErr(err);
                const username = user_db.Item.Username;
                const password = user_db.Item.Password;
                const fullname = user_db.Item.FullName;
                let user_response = new UserDB(username, password, fullname);
                // Obtener sus fotos
                return client_dynamodb.scan({
                    TableName: table_photos.Name, FilterExpression: 'Username=:name', ExpressionAttributeValues: { ":name": key.Username }
                }, function (err, photos_db) {
                    if (err) return returnErr(err);
                    for (let i = 0; i < photos_db.Items.length; i++) {
                        const photo = photos_db.Items[i];
                        const url = photo.PhotoURL;
                        const albumName = photo.AlbumName;
                        user_response.addPhoto(url, albumName);
                    }
                    console.log(user_response.printUser());
                    return user_response;
                });
            } catch (error) {
                console.log(error)
            }
        });
    } catch (error) {
        //console.log(error)
        return
    }
}

// add_user('luisd', '0000', 'Luis Danniel Castellanos', getBase64('../perfil1.txt'), 'img1.jpg');
// login_user('luisd', '0000');
//get_user('luisd');

module.exports.getUsuario = function (username) {
    return new Promise((resolve,reject) => {
        try {
            var params = {TableName: 'Users', Key: {"Username":username}}
            var datos_usuario
            client_dynamodb.get(params, function(err,data){
                if (err) {console.log(err); return resolve(false)
                } else {
                    if (!data.Item) {
                        return resolve({data:'No existe usuario que ingreso',status:400})
                    }
                    datos_usuario = data.Item
                    client_dynamodb.scan({TableName: "Photos", FilterExpression: 'Username=:name and AlbumName=:album', ExpressionAttributeValues: { ":name": username,":album":"Fotos de Perfil" }
                    }, function (err, photos_db) {
                        if (err) return resolve({data:'Error en query',status:400})
                        else if(photos_db.Count==0) return resolve({data:'No hay fotos',status:400})
                        else{
                            var ultimaFoto = photos_db.Items[photos_db.Count-1]
                            jsonReturn = {user: datos_usuario.Username,
                                                password: '',
                                                photo: ultimaFoto.PhotoURL,
                                                name: datos_usuario.FullName}
                            return resolve({data:jsonReturn,status:200})
                        }
                    });
                }
             })
        } catch (error) {
            console.log(error)
            return resolve({data:'Ocurrio un error al obtener el usuario',status:400})
        }
    })
}

module.exports.updateUser = function (pastUser,username,pass,fullname) {
    return new Promise((resolve,reject)=> {
        try {
            return client_dynamodb.get(
                { TableName: table_users.Name, Key: { 'Username': pastUser } },
                (err, data) => {
                    if (err) return resolve({data:'Error al hacer consulta dynamodb',status:400})
                    if (!data.Item) return resolve({data:'No existe el usuario',status:400})
                    // Creación de parámetros
                    const item_users = {
                        Username: username,
                        Password: pass,
                        FullName: fullname
                    }
                    //return resolve(true)
                    //Insertar usuario
                    return client_dynamodb.put({
                        TableName: table_users.Name, Item: item_users
                    }, function (err) {
                        if (!err) {
                            return resolve(true)
                        } else return resolve({data:'Error al actualizar el usuario',status:400});
                    });
                });
        } catch (error) {
            console.log(error)
            return resolve({data:'Ocurrio un error al obtener el usuario',status:400})
        }
    })
}

module.exports.deleteUser = function (username,pass) {
    return new Promise((resolve,reject)=> {
        try {
            client_dynamodb.get({TableName: table_users.Name, Key: {"Username":username}}, function(err,data){
                if (err) {return resolve({data:'Problema al eliminar usuario1',status:400})}
                if (!data.Item) {return resolve({data:'No existe usuario',status:400})}

                datos_usuario = data.Item
                console.log(String(pass),String(datos_usuario.Password))
                if(String(datos_usuario.Password)!=String(pass)) {return resolve({data:'Contraseña de confirmacion no coincide',status:400})}
                var params = {
                    TableName:table_users.Name,
                    Key:{
                        "Username":username
                    }
                };
                client_dynamodb.delete(params,function (err,data) {
                    if (!err) {
                        return resolve({data:'Se elimino usuario',status:200})
                    }else {
                        console.log(err)
                        return resolve({data:'Problema al eliminar usuario',status:400})
                    }
                })
             })
        } catch (error) {
            //console.log(error)
            return resolve({data:'Ocurrio un error al obtener el usuario',status:400})
        }
    })
}

function getBase64(path) {
    var fs = require('fs');
    const data = fs.readFileSync(path, 'utf8');
    return data;
}