var AWS = require("aws-sdk");
const dotenv = require('dotenv');
const UserDB = require("./objects/user");
const Photo = require("./objects/photo");
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
const bucket_name = "practica1.g10.imagenes"

function returnErr(error) {
    console.log(error);
    return false;
}

/* REGISTRAR UN USUARIO */
function add_user(username, password, fullname, base64_photo, filename_photo) {
    // Verificar que no exista el usuario
    return new Promise((resolve, reject) => {
        client_dynamodb.get(
            { TableName: table_users.Name, Key: { 'Username': username } },
            (err, data) => {
                if (err) console.log(err);
                if (data.Item) resolve(returnErr("User already exists"));
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
                client_dynamodb.put({
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
                            client_s3.putObject(params, function (err) {
                                if (!err) {
                                    // Insertar ruta en Dynamo
                                    client_dynamodb.put({
                                        TableName: table_photos.Name, Item: item_photos
                                    }, (err) => {
                                        if (!err) {
                                            console.log("User added correctly");
                                            resolve(true);
                                        }
                                    });
                                }
                                else resolve(returnErr(err));
                            });
                        }
                    } else resolve(returnErr(err));
                });
            });
    });
}

/* VERIFICAR LOGIN */
function login_user(username, password) {
    return new Promise((resolve, reject) => {
        const key = { 'Username': username };
        client_dynamodb.get({ TableName: table_users.Name, Key: key },
            function (err, user) {
                if (!err) {
                    if (!user.Item) resolve(returnErr("The user doesn't exists"));
                    // console.log(user)
                    const password_db = user.Item.Password;
                    if (password_db == password) { // Ambas password deben estar en md5
                        console.log("Login is correct");
                        resolve(true);
                    }
                    else resolve(returnErr("The password is incorrect"));
                }
                else resolve(returnErr(err));
            });
    });
}

/* OBTENER TODA LA DATA DE UN USUARIO */
function get_user(__username) {
    return new Promise((resolve, reject) => {
        try {
            const key = { 'Username': __username };
            // Obtener el usuario
            client_dynamodb.get({ TableName: table_users.Name, Key: key },
                function (err, user_db) {
                    if (err) resolve(returnErr(err));
                    const username = user_db.Item.Username;
                    const password = user_db.Item.Password;
                    const fullname = user_db.Item.FullName;
                    let user_response = new UserDB(username, password, fullname);
                    // Obtener sus fotos
                    client_dynamodb.scan({
                        TableName: table_photos.Name, FilterExpression: 'Username=:name', ExpressionAttributeValues: { ":name": key.Username }
                    }, function (err, photos_db) {
                        if (err) resolve(returnErr(err));
                        for (let i = 0; i < photos_db.Items.length; i++) {
                            const photo = photos_db.Items[i];
                            const url = photo.PhotoURL;
                            const albumName = photo.AlbumName;
                            user_response.addPhoto(url, albumName);
                        }
                        console.log(user_response.printUser());
                        resolve(user_response);
                    });
                });
        } catch (error) {
            resolve(returnErr(error));
        }
    });
}

/* SUBIR FOTO A ALBUM DE USUARIO (PARA CREAR UN ALBUM ES NECESARIO SUBIR UNA FOTO) */
function uploadPhoto(username, albumName, base64_photo, filename_photo) {
    return new Promise((resolve, reject) => {
        const url = "Fotos_Publicadas/" + username + "/" + albumName + "/" + filename_photo;
        const item_photos = {
            PhotoURL: url,
            AlbumName: albumName,
            Username: username
        };
        let b64_decode = new Buffer.from(base64_photo, 'base64');
        const params = {
            Bucket: bucket_name,
            Key: url,
            Body: b64_decode,
            ContentType: "image"
        };
        // Insertar ruta en Dynamo
        client_dynamodb.put(
            { TableName: table_photos.Name, Item: item_photos },
            function (err) {
                if (!err) {
                    // Guardar la foto en bucket S3
                    client_s3.putObject(params, function (err) {
                        if (!err) {
                            console.log("Upload Successful")
                            resolve(true);
                        }
                        else resolve(returnErr(err));
                    });
                }
                else resolve(returnErr(err));
            });
    });
}


/* ACTUALIZAR LA FOTO DE PERFIL */
function updateProfilePhoto(__username, new_b64_profile_photo, new_filename_photo) {
    return new Promise((resolve, reject) => {
        // Obtener el usuario
        get_user(__username).then((user) => {
            if (user) {
                let old_photo = user.getProfilePhoto();
                let new_url_old_photo = "Fotos_Perfil/" + __username + "/" + old_photo.getFilename();
                let params = {
                    Bucket: bucket_name,
                    CopySource: bucket_name + '/' + old_photo.getUrl(),
                    Key: new_url_old_photo
                };
                // Copiar a la carpeta común
                client_s3.copyObject(params,
                    function (err) {
                        if (!err) {
                            // Eliminar la que estaba en /actual
                            client_s3.deleteObject({ Bucket: bucket_name, Key: old_photo.getUrl() },
                                function (err) {
                                    if (!err) {
                                        // Cargar la nueva en /actual
                                        let new_url = "Fotos_Perfil/" + __username + "/actual/" + new_filename_photo;
                                        let item_photos = {
                                            PhotoURL: new_url,
                                            AlbumName: "Fotos de Perfil",
                                            Username: __username
                                        };
                                        let b64_decode = new Buffer.from(new_b64_profile_photo, 'base64');
                                        params = {
                                            Bucket: bucket_name,
                                            Key: new_url,
                                            Body: b64_decode,
                                            ContentType: "image"
                                        };
                                        // Guardar la foto en bucket
                                        client_s3.putObject(params, function (err) {
                                            if (!err) {
                                                // Insertar ruta en Dynamo
                                                client_dynamodb.put({ TableName: table_photos.Name, Item: item_photos },
                                                    function (err) {
                                                        if (!err) {
                                                            // Actualizar item antiguo en Dynamo
                                                            let key = {
                                                                PhotoURL: old_photo.getUrl(),
                                                                Username: __username
                                                            };
                                                            client_dynamodb.delete({ TableName: table_photos.Name, Key: key },
                                                                function (err) {
                                                                    if (!err) {
                                                                        // Reutilizar el item cambiando la url
                                                                        item_photos.PhotoURL = new_url_old_photo;
                                                                        client_dynamodb.put({ TableName: table_photos.Name, Item: item_photos },
                                                                            function (err) {
                                                                                if (!err) {
                                                                                    console.log("Profile photo updated correctly");
                                                                                    resolve(true);
                                                                                } else resolve(returnErr(err));
                                                                            });
                                                                    } else resolve(returnErr(err));
                                                                });
                                                        } else resolve(returnErr(err));
                                                    });
                                            } else resolve(returnErr(err));
                                        });
                                    } else resolve(returnErr(err));
                                });
                        } else { console.log("F", params); resolve(returnErr(err)); }
                    });
            } else resolve(returnErr("User not found"));
        });
    });
}

/* EDITAR UN USUARIO (FULLNAME O USERNAME) */
function updateUser(__username, __password, new_username, new_fullname) {
    return new Promise((resolve, reject) => {
        const key = { 'Username': __username };
        // Obtener el usuario
        client_dynamodb.get({ TableName: table_users.Name, Key: key },
            function (err, user_db) {
                if (err) resolve(returnErr(err));
                let password_db = user_db.Item.Password;
                let fullname_db = user_db.Item.FullName;

                if (password_db != __password) {  // Ambas password deben estar en md5
                    resolve(returnErr("The password is incorrect"));
                }
                if (new_username) {  // Se deben actualizar todas URLS
                    // Obtener el usuario
                    get_user(__username).then((user) => {
                        updateUsername_URLS(user, new_username).then((r) => {
                            if (r) {
                                client_dynamodb.delete({ TableName: table_users.Name, Key: key },
                                    function (err) {
                                        if (!err) {
                                            add_user((new_username || __username), __password, (new_fullname || fullname_db), '', '')
                                                .then((r) => resolve(r));
                                        } else resolve(returnErr(err));
                                    });
                            } else resolve(returnErr("Error: URLS didn't updated"))
                        });
                    });
                } else {
                    // Sólo se cambia el nombre
                    client_dynamodb.delete({ TableName: table_users.Name, Key: key },
                        function (err) {
                            if (!err) {
                                add_user((new_username || __username), __password, (new_fullname || fullname_db), '', '')
                                    .then((r) => resolve(r));
                            } else resolve(returnErr(err));
                        });
                }
            });
    });
}

/* ACTUALIZAR TODAS LAS RUTAS POR EL CAMBIO DE USERNAME */
function updateUsername_URLS(old_user, new_username) {
    return new Promise((resolve, reject) => {
        let response = false;
        // Actualizar en el Bucket S3
        let old_photos = old_user.getPhotos();
        for (let i = 0; i < old_photos.length; i++) {
            const old_photo = old_photos[i];
            let new_photo = new Photo(old_photo.getUrl(), old_photo.getAlbumName(), old_photo.getUsername());
            new_photo.changeUsername(new_username);
            const copy_params = {
                Bucket: bucket_name,
                CopySource: bucket_name + '/' + old_photo.getUrl(),
                Key: new_photo.getUrl()
            };
            // Copiar a la nueva carpeta
            client_s3.copyObject(copy_params, function (err) {
                if (!err) {
                    // Eliminar la que estaba en /actual
                    client_s3.deleteObject({ Bucket: bucket_name, Key: old_photo.getUrl() },
                        function (err) {
                            if (!err) {
                                // Insertar ruta en Dynamo
                                const item_photos = {
                                    PhotoURL: new_photo.getUrl(),
                                    AlbumName: new_photo.getAlbumName(),
                                    Username: new_photo.getUsername()
                                };
                                client_dynamodb.put({ TableName: table_photos.Name, Item: item_photos },
                                    function (err) {
                                        if (!err) {
                                            // Eliminar ruta antigua en Dynamo
                                            const key = {
                                                PhotoURL: old_photo.getUrl(),
                                                Username: old_photo.getUsername()
                                            }
                                            client_dynamodb.delete({ TableName: table_photos.Name, Key: key },
                                                function (err) {
                                                    if (!err) {
                                                        response = true;
                                                    } else resolve(returnErr(err));
                                                });
                                        } else resolve(returnErr(err));
                                    });
                            } else resolve(returnErr(err));
                        });
                } else resolve(returnErr(err));
            });
        }
        if (response)
            console.log("URLS updated")
        resolve(response);
    });
}


/* ELIMINAR UN ALBUM (No se debe poder eliminar el album de fotos de perfil) */
function deleteAlbum(username, albumName) {
    return new Promise((resolve, reject) => {
        let response = false;
        get_user(username).then((user) => {
            let photos = user.getPhotos();
            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i];
                if (photo.getAlbumName() == albumName) {
                    // Eliminar en bucket S3
                    client_s3.deleteObject({ Bucket: bucket_name, Key: photo.getUrl() },
                        function (err) {
                            if (!err) {
                                // Eliminar en DynamoDB
                                const key = {
                                    PhotoURL: photo.getUrl(),
                                    Username: photo.getUsername()
                                };
                                client_dynamodb.delete({ TableName: table_photos.Name, Key: key },
                                    function (err) {
                                        if (!err) {
                                            response = true;
                                        }
                                        else resolve(returnErr(err));
                                    });
                            }
                            else resolve(returnErr(err));
                        });
                }
            }
            if (response)
                console.log("Album deleted");
            resolve(response);
        });
    });
}

/* ELIMINAR UNA FOTO DEL ALBUM */
function deletePhoto(username, URL_photo) {
    return new Promise((resolve, reject) => {
        // Eliminar en bucket S3 (Sin la dirección 's3.amazonaws.com/practica1-G10-imagenes/')
        client_s3.deleteObject({ Bucket: bucket_name, Key: URL_photo },
            function (err) {
                if (!err) {
                    // Eliminar en DynamoDB
                    const key = {
                        PhotoURL: URL_photo,
                        Username: username
                    };
                    client_dynamodb.delete({ TableName: table_photos.Name, Key: key },
                        function (err) {
                            if (!err) {
                                console.log("Photo deleted");
                                resolve(true);
                            }
                            else resolve(returnErr(err));
                        }
                    );
                }
                else resolve(returnErr(err));
            }
        );
    });
}

// add_user('luisd', '0000', 'Luis Danniel Castellanos', getBase64('../perfil1.txt'), 'img1.jpg');
// login_user('luisd', '0000');
// uploadPhoto('luisd', 'Pensums', getBase64('../sistemas.txt'), 'Sistemas.jpg');
// uploadPhoto('luisd', 'Pensums', getBase64('../industrial.txt'), 'Industrial.jpg');
// updateProfilePhoto('luisd', getBase64('../perfil2.txt'), 'img2.jpg');
// deletePhoto('luisd','Fotos_Publicadas/luisd/Pensums/Industrial.jpg');
// deleteAlbum('ldecast', 'Pensums');
// updateUser('luisd', '0000', '', 'Luis Danniel Ernesto Castellanos Galindo');
// updateUser('luisd', '0000', 'ldecast', '');

// get_user('ldecast');












function getBase64(path) {
    var fs = require('fs');
    const data = fs.readFileSync(path, 'utf8');
    return data;
}