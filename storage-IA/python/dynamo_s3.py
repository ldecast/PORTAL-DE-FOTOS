from objects.photo import Photo
from objects.user import UserDB
from ia import getPhotoLabels
import base64
import io

client_dynamodb = None
client_s3 = None


TABLE_USERS = {
    'Name': 'Users',
    'Attributes': ['Username', 'Password', 'FullName']
}

TABLE_PHOTOS = {
    'Name': 'Photos',
    'Attributes': ['PhotoURL', 'Tags', 'Username', 'Description']
}

BUCKET_NAME = "imagenes.semi1"
# BUCKET_NAME = "practica1.g10.imagenes"


# REGISTRAR UN USUARIO
def add_user(username: str, password: str, fullname: str, base64_photo: str, filename_photo: str) -> bool:
    # Verificar que no exista el usuario
    if 'Item' in client_dynamodb.get_item(TableName=TABLE_USERS['Name'], Key={'Username': {'S': username}}):
        print("User already exists")
        return False

    item_users = {
        'Username': {'S': username},
        'Password': {'S': password},
        'FullName': {'S': fullname}
    }
    url = "Fotos_Perfil/"+username+"/actual/"+filename_photo
    item_photos = {
        'PhotoURL': {'S': url},
        # TODO Agregar extracción de etiquetas de la foto de perfil
        'Tags': {'SS': ["Person", "Human"]},
        'Username': {'S': username},
        'Description': {'S': 'Primera foto de perfil'}
    }
    try:
        print("Adding user:", item_users)
        # Insertar usuario
        client_dynamodb.put_item(
            TableName=TABLE_USERS['Name'], Item=item_users)
        if base64_photo and filename_photo:
            # Guardar la foto en bucket S3
            b64_decode = base64.b64decode(base64_photo)
            client_s3.upload_fileobj(
                io.BytesIO(b64_decode), BUCKET_NAME, url,
                ExtraArgs={'ContentType': "image"}
            )
            # Insertar ruta en Dynamo
            client_dynamodb.put_item(
                TableName=TABLE_PHOTOS['Name'], Item=item_photos
            )
    except:
        print("The user has not been added")
        return False
    else:
        print("User added correctly")
        return True


# VERIFICAR LOGIN
def login_user(username: str, password: str, photo: str) -> bool:
    key = {
        'Username': {'S': username}
    }
    user = client_dynamodb.get_item(TableName=TABLE_USERS['Name'], Key=key)
    if 'Item' not in user:
        print("The user doesn't exists")
        return False
    if password:
        password_db = user['Item']['Password']['S']
        if password_db == password:  # Ambas password deben estar en md5
            print("Login is correct")
            return True
        print("The password is incorrect")
        return False
    elif photo:
        # Insertar reconocimiento facial
        pass
    else:
        print("Password or photo must be provided.")
        return False


# OBTENER TODA LA DATA DE UN USUARIO
def get_user(__username: str) -> UserDB:
    key = {
        'Username': {'S': __username}
    }
    # Obtener el usuario
    user_db = client_dynamodb.get_item(TableName=TABLE_USERS['Name'], Key=key)
    username = user_db['Item']['Username']['S']
    password = user_db['Item']['Password']['S']
    fullname = user_db['Item']['FullName']['S']
    user_response = UserDB(username, password, fullname)
    # Obtener sus fotos
    photos_db = client_dynamodb.scan(
        TableName=TABLE_PHOTOS['Name'], FilterExpression='Username=:name', ExpressionAttributeValues={":name": key['Username']})
    for photo in photos_db['Items']:
        url = photo['PhotoURL']['S']
        tags = photo['Tags']['SS']
        description = photo['Description']['S']
        user_response.addPhoto(url, tags, description)
    print(user_response)
    return user_response


# SUBIR FOTO Y ALMACENAR SUS ETIQUETAS
def uploadPhoto(username: str, base64_photo: str, filename_photo: str, description: str):
    url = "Fotos_Publicadas/"+username+"/"+filename_photo
    b64_decode = base64.b64decode(base64_photo)
    item_photos = {
        'PhotoURL': {'S': url},
        'Tags': {'SS': getPhotoLabels(b64_decode)},
        'Username': {'S': username},
        'Description': {'S': description}
    }
    # Insertar ruta en Dynamo
    client_dynamodb.put_item(
        TableName=TABLE_PHOTOS['Name'], Item=item_photos)
    # Guardar la foto en bucket
    client_s3.upload_fileobj(io.BytesIO(b64_decode), BUCKET_NAME, url,
                             ExtraArgs={'ContentType': "image"})
    print("Upload Successful")


# ACTUALIZAR LA FOTO DE PERFIL
def updateProfilePhoto(__username: str, new_b64_profile_photo: str, new_filename_photo: str) -> bool:
    # Obtener el usuario
    user = get_user(__username)
    old_photo = user.getProfilePhoto()
    new_url_old_photo = "Fotos_Perfil/"+__username+"/"+old_photo.getFilename()
    copy_source = {
        'Bucket': BUCKET_NAME,
        'Key': old_photo.getUrl()
    }
    # Copiar a la carpeta común
    client_s3.copy(
        copy_source,
        BUCKET_NAME,
        new_url_old_photo
    )
    # Eliminar la que estaba en /actual
    client_s3.delete_object(
        Bucket=BUCKET_NAME,
        Key=old_photo.getUrl()
    )
    # Cargar la nueva en /actual
    new_url = "Fotos_Perfil/"+__username+"/actual/"+new_filename_photo
    b64_decode = base64.b64decode(new_b64_profile_photo)
    item_photos = {
        'PhotoURL': {'S': new_url},
        'Tags': {'SS': getPhotoLabels(b64_decode)},
        'Username': {'S': __username},
        'Description': {'S': 'Nueva foto de perfil'}
    }
    # Guardar la foto en bucket
    client_s3.upload_fileobj(io.BytesIO(b64_decode), BUCKET_NAME, new_url,
                             ExtraArgs={'ContentType': "image"})
    # Insertar ruta en Dynamo
    client_dynamodb.put_item(
        TableName=TABLE_PHOTOS['Name'], Item=item_photos)
    # Actualizar item antiguo en Dynamo
    key = {
        'PhotoURL': {'S': old_photo.getUrl()},
        'Username': {'S': __username}
    }
    client_dynamodb.delete_item(
        TableName=TABLE_PHOTOS['Name'], Key=key)
    # Reutilizar el item cambiando la url
    item_photos['PhotoURL']['S'] = new_url_old_photo
    client_dynamodb.put_item(
        TableName=TABLE_PHOTOS['Name'], Item=item_photos)
    return True


# EDITAR UN USUARIO (FULLNAME O USERNAME)
def updateUser(__username: str, __password: str, new_username: str, new_fullname: str) -> bool:
    key = {'Username': {'S': __username}}
    # Obtener el usuario
    user_db = client_dynamodb.get_item(TableName=TABLE_USERS['Name'], Key=key)
    password_db = user_db['Item']['Password']['S']
    fullname_db = user_db['Item']['FullName']['S']

    if password_db != __password:  # Ambas password deben estar en md5
        print("The password is incorrect")
        return False

    if new_username:  # Se deben actualizar todas URLS
        # Obtener el usuario
        user = get_user(__username)
        updateUsername_URLS(user, new_username)

    client_dynamodb.delete_item(
        TableName=TABLE_USERS['Name'],
        Key=key
    )
    add_user((new_username or __username), __password,
             (new_fullname or fullname_db), '', '')
    return True


# ACTUALIZAR TODAS LAS RUTAS POR EL CAMBIO DE USERNAME
def updateUsername_URLS(old_user: UserDB, new_username: str):
    # Actualizar en el Bucket S3
    for old_photo in old_user.getPhotos():
        new_photo = Photo(
            old_photo.getUrl(),
            old_photo.getTags(),
            old_photo.getUsername(),
            old_photo.getDescription()
        )
        new_photo.changeUsername(new_username)
        copy_source = {
            'Bucket': BUCKET_NAME,
            'Key': old_photo.getUrl()
        }
        # Copiar a la nueva carpeta
        client_s3.copy(
            copy_source,
            BUCKET_NAME,
            new_photo.getUrl()
        )
        # Eliminar la que estaba en /actual
        client_s3.delete_object(
            Bucket=BUCKET_NAME,
            Key=old_photo.getUrl()
        )
        # Insertar ruta en Dynamo
        item_photos = {
            'PhotoURL': {'S': new_photo.getUrl()},
            'Tags': {'SS': new_photo.getTags()},
            'Username': {'S': new_photo.getUsername()},
            'Description': {'S': new_photo.getDescription()}
        }
        client_dynamodb.put_item(
            TableName=TABLE_PHOTOS['Name'], Item=item_photos
        )
        # Eliminar ruta antigua en Dynamo
        key = {
            'PhotoURL': {'S': old_photo.getUrl()},
            'Username': {'S': old_photo.getUsername()}
        }
        client_dynamodb.delete_item(
            TableName=TABLE_PHOTOS['Name'],
            Key=key
        )
    return True


# ELIMINAR UNA FOTO
def deletePhoto(username: str, URL_photo: str) -> bool:
    # Eliminar en bucket S3
    client_s3.delete_object(
        Bucket=BUCKET_NAME,
        Key=URL_photo  # Sin la dirección 's3.amazonaws.com/practica1-G10-imagenes/'
    )
    # Eliminar en DynamoDB
    key = {
        'PhotoURL': {'S': URL_photo},
        'Username': {'S': username}
    }
    client_dynamodb.delete_item(
        TableName=TABLE_PHOTOS['Name'],
        Key=key
    )
    return True


#UTILIZACION DE CHAT
def chatbot(text: str):
    client_s3.recognize_text()