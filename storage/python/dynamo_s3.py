import base64
from objects.photo import Photo
from objects.user import UserDB
import boto3  # pip install boto3
from dotenv import load_dotenv
import os
import io

load_dotenv()

ACCESS_KEY_ID = os.getenv('ACCESS_KEY_ID')
SECRET_ACCESS_KEY = os.getenv('SECRET_ACCESS_KEY')
REGION_NAME = os.getenv('REGION_NAME')

client_dynamodb = None
client_s3 = None

table_users = {
    'Name': 'Users',
    'Attributes': ['Username', 'Password', 'FullName']
}

table_photos = {
    'Name': 'Photos',
    'Attributes': ['PhotoURL', 'AlbumName', 'Username']
}

bucket_name = "practica1-G10-imagenes"


# CONECTAR A LA BASE DE DATOS
def connectDynamoDB() -> bool:
    try:
        global client_dynamodb
        client_dynamodb = boto3.client('dynamodb', aws_access_key_id=ACCESS_KEY_ID,
                                       aws_secret_access_key=SECRET_ACCESS_KEY, region_name=REGION_NAME)
    except:
        print("Something went wrong connecting the client")
        return False
    else:
        print("DynamoDB client connected!")
        return True


# CONECTAR A BUCKET S3 DE IMAGENES
def connectBucketS3() -> bool:
    try:
        global client_s3
        client_s3 = boto3.client('s3',
                                 aws_access_key_id=ACCESS_KEY_ID,
                                 aws_secret_access_key=SECRET_ACCESS_KEY,
                                 region_name=REGION_NAME)
    except:
        print("Something went wrong connecting the S3 client")
        return False
    else:
        print("S3 client connected!")
        return True


# REGISTRAR UN USUARIO
def add_user(username: str, password: str, fullname: str, base64_photo: str, filename_photo: str) -> bool:
    # Verificar que no exista el usuario
    if 'Item' in client_dynamodb.get_item(TableName=table_users['Name'], Key={'Username': {'S': username}}):
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
        'AlbumName': {'S': "Fotos de Perfil"},
        'Username': {'S': username}
    }
    b64_decode = base64.b64decode(base64_photo)
    try:
        print("Adding user:", item_users)
        # Insertar usuario
        client_dynamodb.put_item(
            TableName=table_users['Name'], Item=item_users)
        if base64_photo and filename_photo:
            # Guardar la foto en bucket S3
            client_s3.upload_fileobj(io.BytesIO(b64_decode), bucket_name, url,
                                     ExtraArgs={'ContentType': "image"})
            # Insertar ruta en Dynamo
            client_dynamodb.put_item(
                TableName=table_photos['Name'], Item=item_photos)
    except:
        print("The user has not been added")
        return False
    else:
        print("User added correctly")
        return True


# VERIFICAR LOGIN
def login_user(username: str, password: str) -> bool:
    key = {
        'Username': {'S': username}
    }
    user = client_dynamodb.get_item(TableName=table_users['Name'], Key=key)
    if 'Item' not in user:
        print("The user doesn't exists")
        return False
    password_db = user['Item']['Password']['S']
    if password_db == password:  # Ambas password deben estar en md5
        print("Login is correct")
        return True
    print("The password is incorrect")
    return False


# OBTENER TODA LA DATA DE UN USUARIO
def get_user(__username: str) -> UserDB:
    key = {
        'Username': {'S': __username}
    }
    # Obtener el usuario
    user_db = client_dynamodb.get_item(TableName=table_users['Name'], Key=key)
    username = user_db['Item']['Username']['S']
    password = user_db['Item']['Password']['S']
    fullname = user_db['Item']['FullName']['S']
    user_response = UserDB(username, password, fullname)
    # Obtener sus fotos
    photos_db = client_dynamodb.scan(
        TableName=table_photos['Name'], FilterExpression='Username=:name', ExpressionAttributeValues={":name": key['Username']})
    for photo in photos_db['Items']:
        url = photo['PhotoURL']['S']
        albumName = photo['AlbumName']['S']
        user_response.addPhoto(url, albumName)
    # print(user_response)
    return user_response


# SUBIR FOTO A ALBUM DE USUARIO (PARA CREAR UN ALBUM ES NECESARIO SUBIR UNA FOTO)
def uploadPhoto(username: str, albumName: str, base64_photo: str, filename_photo: str):
    url = "Fotos_Publicadas/"+username+"/"+albumName+"/"+filename_photo
    item_photos = {
        'PhotoURL': {'S': url},
        'AlbumName': {'S': albumName},
        'Username': {'S': username}
    }
    b64_decode = base64.b64decode(base64_photo)
    # Insertar ruta en Dynamo
    client_dynamodb.put_item(
        TableName=table_photos['Name'], Item=item_photos)
    # Guardar la foto en bucket
    client_s3.upload_fileobj(io.BytesIO(b64_decode), bucket_name, url,
                             ExtraArgs={'ContentType': "image"})
    print("Upload Successful")


# ACTUALIZAR LA FOTO DE PERFIL
def updateProfilePhoto(__username: str, new_b64_profile_photo: str, new_filename_photo: str) -> bool:
    # Obtener el usuario
    user = get_user(__username)
    old_photo = user.getProfilePhoto()
    new_url_old_photo = "Fotos_Perfil/"+__username+"/"+old_photo.getFilename()
    copy_source = {
        'Bucket': bucket_name,
        'Key': old_photo.getUrl()
    }
    # Copiar a la carpeta común
    client_s3.copy(
        copy_source,
        bucket_name,
        new_url_old_photo
    )
    # Eliminar la que estaba en /actual
    client_s3.delete_object(
        Bucket=bucket_name,
        Key=old_photo.getUrl()
    )
    # Cargar la nueva en /actual
    new_url = "Fotos_Perfil/"+__username+"/actual/"+new_filename_photo
    item_photos = {
        'PhotoURL': {'S': new_url},
        'AlbumName': {'S': "Fotos de Perfil"},
        'Username': {'S': __username}
    }
    b64_decode = base64.b64decode(new_b64_profile_photo)
    # Guardar la foto en bucket
    client_s3.upload_fileobj(io.BytesIO(b64_decode), bucket_name, new_url,
                             ExtraArgs={'ContentType': "image"})
    # Insertar ruta en Dynamo
    client_dynamodb.put_item(
        TableName=table_photos['Name'], Item=item_photos)
    # Actualizar item antiguo en Dynamo
    key = {
        'PhotoURL': {'S': old_photo.getUrl()},
        'Username': {'S': __username}
    }
    client_dynamodb.delete_item(
        TableName=table_photos['Name'], Key=key)
    # Reutilizar el item cambiando la url
    item_photos['PhotoURL']['S'] = new_url_old_photo
    client_dynamodb.put_item(
        TableName=table_photos['Name'], Item=item_photos)
    return True


# EDITAR UN USUARIO (FULLNAME O USERNAME)
def updateUser(__username: str, __password: str, new_username: str, new_fullname: str) -> bool:
    key = {'Username': {'S': __username}}
    # Obtener el usuario
    user_db = client_dynamodb.get_item(TableName=table_users['Name'], Key=key)
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
        TableName=table_users['Name'],
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
            old_photo.getUrl(), old_photo.getAlbumName(), old_photo.getUsername()
        )
        new_photo.changeUsername(new_username)
        copy_source = {
            'Bucket': bucket_name,
            'Key': old_photo.getUrl()
        }
        # Copiar a la nueva carpeta
        client_s3.copy(
            copy_source,
            bucket_name,
            new_photo.getUrl()
        )
        # Eliminar la que estaba en /actual
        client_s3.delete_object(
            Bucket=bucket_name,
            Key=old_photo.getUrl()
        )
        # Insertar ruta en Dynamo
        item_photos = {
            'PhotoURL': {'S': new_photo.getUrl()},
            'AlbumName': {'S': new_photo.getAlbumName()},
            'Username': {'S': new_photo.getUsername()}
        }
        client_dynamodb.put_item(
            TableName=table_photos['Name'], Item=item_photos)
        # Eliminar ruta antigua en Dynamo
        key = {
            'PhotoURL': {'S': old_photo.getUrl()},
            'Username': {'S': old_photo.getUsername()}
        }
        client_dynamodb.delete_item(
            TableName=table_photos['Name'],
            Key=key
        )


# ELIMINAR UN ALBUM (No se debe poder eliminar el album de fotos de perfil)
def deleteAlbum(username: str, albumName: str) -> bool:
    user = get_user(username)
    for photo in user.getPhotos():
        if photo.getAlbumName() == albumName:
            # Eliminar en bucket S3
            client_s3.delete_object(
                Bucket=bucket_name,
                Key=photo.getUrl()
            )
            # Eliminar en DynamoDB
            key = {
                'PhotoURL': {'S': photo.getUrl()},
                'Username': {'S': photo.getUsername()}
            }
            client_dynamodb.delete_item(
                TableName=table_photos['Name'],
                Key=key
            )
    return True


# ELIMINAR UNA FOTO DEL ALBUM
def deletePhoto(username: str, URL_photo: str) -> bool:
    # Eliminar en bucket S3
    client_s3.delete_object(
        Bucket=bucket_name,
        Key=URL_photo  # Sin la dirección 's3.amazonaws.com/practica1-G10-imagenes/'
    )
    # Eliminar en DynamoDB
    key = {
        'PhotoURL': {'S': URL_photo},
        'Username': {'S': username}
    }
    client_dynamodb.delete_item(
        TableName=table_photos['Name'],
        Key=key
    )
    return True


if __name__ == '__main__':
    if connectDynamoDB():
        # get_user('ldecast')
        pass
