var AWS = require("aws-sdk");
const dotenv = require('dotenv');
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
const bucket_name = "practica1.g10.imagenes"

function returnErr(error) {
    console.log(error);
    return false;
}

/* REGISTRAR UN USUARIO */
function add_user(username, password, fullname, base64_photo, filename_photo) {
    // Verificar que no exista el usuario
    return client_dynamodb.get(
        { TableName: table_users.Name, Key: { 'Username': username } },
        (err, data) => {
            if (err) console.log(err);
            if (data.Item) return returnErr("User already exists");
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
                                        return true;
                                    }
                                });
                            }
                            else return returnErr(err);
                        });
                    }
                } else return returnErr(err);
            });
        });
}

/* VERIFICAR LOGIN */
function login_user(username, password) {
    const key = { 'Username': username };
    return client_dynamodb.get({ TableName: table_users.Name, Key: key },
        function (err, user) {
            if (err) return returnErr(err);
            if (!user.Item) return returnErr("The user doesn't exists");
            // console.log(user)
            password_db = user.Item.Password;
            if (password_db == password) { // Ambas password deben estar en md5
                console.log("Login is correct");
                return true;
            }
            else return returnErr("The password is incorrect");
        });
}

/* OBTENER TODA LA DATA DE UN USUARIO */
function get_user(__username) {
    const key = { 'Username': __username };
    // Obtener el usuario
    return client_dynamodb.get({ TableName: table_users.Name, Key: key },
        function (err, user_db) {
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
        });
}

// add_user('luisd', '0000', 'Luis Danniel Castellanos', getBase64('../perfil1.txt'), 'img1.jpg');
// login_user('luisd', '0000');
get_user('luisd');













function getBase64(path) {
    var fs = require('fs');
    const data = fs.readFileSync(path, 'utf8');
    return data;
}