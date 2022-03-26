import base64
from .objects.photo import Photo
from .objects.user import UserDB
import boto3  # pip install boto3
from dotenv import load_dotenv
import os
import io
from storage.rekognition import Compare_faces, getTagsProfilePhoto, translateText

load_dotenv()
ACCESS_KEY_ID = os.getenv('ACCESS_KEY_ID')
SECRET_ACCESS_KEY = os.getenv('SECRET_ACCESS_KEY')
REGION_NAME = os.getenv('REGION_NAME')
TABLE_PHOTOS = {
    'Name': 'Photos',
    'Attributes': ['PhotoURL', 'Tags', 'Username', 'Description']
}

BUCKET_NAME = "imagenes.semi1"

client_dynamodb = None
client_s3 = None
client_rekognition = None
client_translate = None

table_users = {
    'Name': 'Users',
    'Attributes': ['Username', 'Password', 'FullName']
}

table_photos = {
    'Name': 'Photos',
    'Attributes': ['PhotoURL', 'AlbumName', 'Username']
}

bucket_name = "practica1.g10.imagenes"

def connect_AWS_Services() -> bool:
    try:
        global client_dynamodb
        global client_s3
        global client_rekognition
        global client_translate
        # CONECTAR A LA BASE DE DATOS
        client_dynamodb = boto3.client('dynamodb',
                                                 aws_access_key_id=ACCESS_KEY_ID,
                                                 aws_secret_access_key=SECRET_ACCESS_KEY,
                                                 region_name=REGION_NAME)
        # CONECTAR A BUCKET S3 DE IMAGENES
        client_s3 = boto3.client('s3',
                                           aws_access_key_id=ACCESS_KEY_ID,
                                           aws_secret_access_key=SECRET_ACCESS_KEY,
                                           region_name=REGION_NAME)
        # CONECTAR A REKOGNITION
        client_rekognition = boto3.client('rekognition',
                                             aws_access_key_id=ACCESS_KEY_ID,
                                             aws_secret_access_key=SECRET_ACCESS_KEY,
                                             region_name=REGION_NAME)

        # CONECTAR A TRANSLATE
        client_translate = boto3.client('translate',
                                           aws_access_key_id=ACCESS_KEY_ID,
                                           aws_secret_access_key=SECRET_ACCESS_KEY,
                                           region_name=REGION_NAME)
    except:
        print("Something went wrong connecting with AWS Services")
        return False
    else:
        print("AWS Services running!")
        return True


# REGISTRAR UN USUARIO
def add_user(username: str, password: str, fullname: str, base64_photo: str,
             filename_photo: str) -> bool:
    # Verificar que no exista el usuario
    if 'Item' in client_dynamodb.get_item(TableName=table_users['Name'],
                                          Key={'Username': {
                                              'S': username
                                          }}):
        print("User already exists")
        return False

    item_users = {
        'Username': {
            'S': username
        },
        'Password': {
            'S': password
        },
        'FullName': {
            'S': fullname
        }
    }
    url = "Fotos_Perfil/" + username + "/actual/" + filename_photo
    item_photos = {
        'PhotoURL': {
            'S': url
        },
        'Tags': {'SS': getTagsProfilePhoto(base64_photo,client_rekognition)},
        'Username': {
            'S': username
        }, 'Description': {'S': 'Primera foto de perfil'}
    }
    try:
        # print("Adding user:", item_users)
        # print(item_photos)
        # Insertar usuario
        client_dynamodb.put_item(TableName=table_users['Name'],
                                 Item=item_users)
        if base64_photo and filename_photo:
            # Guardar la foto en bucket S3
            b64_decode = base64.b64decode(base64_photo)
            client_s3.upload_fileobj(io.BytesIO(b64_decode),
                                     bucket_name,
                                     url,
                                     ExtraArgs={'ContentType': "image"})
            # Insertar ruta en Dynamo
            client_dynamodb.put_item(TableName=table_photos['Name'],
                                     Item=item_photos)
    except:
        print("The user has not been added")
        return False
    else:
        print("User added correctly")
        return True


# VERIFICAR LOGIN
def login_user(username: str, password: str) -> bool:
    key = {'Username': {'S': username}}
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
    key = {'Username': {'S': __username}}
    # Obtener el usuario
    user_db = client_dynamodb.get_item(TableName=table_users['Name'], Key=key)
    if 'Item' not in user_db:
        print("The user doesn't exists")
        return False
    username = user_db['Item']['Username']['S']
    password = user_db['Item']['Password']['S']
    fullname = user_db['Item']['FullName']['S']
    user_response = UserDB(username, password, fullname)
    # Obtener sus fotos
    photos_db = client_dynamodb.scan(
        TableName=table_photos['Name'],
        FilterExpression='Username=:name',
        ExpressionAttributeValues={":name": key['Username']})
    for photo in photos_db['Items']:
        url = photo['PhotoURL']['S']
        tags = photo['Tags']['SS']
        description = photo['Description']['S']
        user_response.addPhoto(url, tags, description)
    return user_response


# SUBIR FOTO A ALBUM DE USUARIO (PARA CREAR UN ALBUM ES NECESARIO SUBIR UNA FOTO)
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
    return True


# ACTUALIZAR FOTO 
def updatePhoto(url:str,album:str,photo:str,username:str):
    user = get_user(username)
    oldPhoto = Photo('','','')
    for element in user.photos:
        if element.url == url:
            oldPhoto = element
            break
    copy_source = {'Bucket': bucket_name, 'Key': oldPhoto.getUrl()}
    if photo == '':
        photo = oldPhoto.getFilename()
    if album == '':
        album = oldPhoto.getAlbumName()
    new_url_old_photo = "Fotos_Publicadas/" + username + "/" + album+"/"+photo
    client_s3.copy(copy_source,bucket_name,new_url_old_photo)
    deletePhoto(username,url)
    item_photos = {
        'PhotoURL': {
            'S': new_url_old_photo
        },
        'AlbumName': {
            'S': album
        },
        'Username': {
            'S': username
        }
    }
    client_dynamodb.put_item(TableName=table_photos['Name'], Item=item_photos)
    return True



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
def updateUser(__username: str, __password: str, new_username: str,
               new_fullname: str) -> bool:
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

    client_dynamodb.delete_item(TableName=table_users['Name'], Key=key)
    add_user((new_username or __username), __password,
             (new_fullname or fullname_db), '', '')
    return True


# ACTUALIZAR TODAS LAS RUTAS POR EL CAMBIO DE USERNAME
def updateUsername_URLS(old_user: UserDB, new_username: str):
    # Actualizar en el Bucket S3
    for old_photo in old_user.getPhotos():
        new_photo = Photo(old_photo.getUrl(), old_photo.getAlbumName(),
                          old_photo.getUsername())
        new_photo.changeUsername(new_username)
        copy_source = {'Bucket': bucket_name, 'Key': old_photo.getUrl()}
        # Copiar a la nueva carpeta
        client_s3.copy(copy_source, bucket_name, new_photo.getUrl())
        # Eliminar la que estaba en /actual
        client_s3.delete_object(Bucket=bucket_name, Key=old_photo.getUrl())
        # Insertar ruta en Dynamo
        item_photos = {
            'PhotoURL': {
                'S': new_photo.getUrl()
            },
            'AlbumName': {
                'S': new_photo.getAlbumName()
            },
            'Username': {
                'S': new_photo.getUsername()
            }
        }
        client_dynamodb.put_item(TableName=table_photos['Name'],
                                 Item=item_photos)
        # Eliminar ruta antigua en Dynamo
        key = {
            'PhotoURL': {
                'S': old_photo.getUrl()
            },
            'Username': {
                'S': old_photo.getUsername()
            }
        }
        client_dynamodb.delete_item(TableName=table_photos['Name'], Key=key)


# ELIMINAR UN ALBUM (No se debe poder eliminar el album de fotos de perfil)
def deleteAlbum(username: str, albumName: str) -> bool:
    user = get_user(username)
    for photo in user.getPhotos():
        if photo.getAlbumName() == albumName:
            # Eliminar en bucket S3
            client_s3.delete_object(Bucket=bucket_name, Key=photo.getUrl())
            # Eliminar en DynamoDB
            key = {
                'PhotoURL': {
                    'S': photo.getUrl()
                },
                'Username': {
                    'S': photo.getUsername()
                }
            }
            client_dynamodb.delete_item(TableName=table_photos['Name'],
                                        Key=key)
    return True


# ELIMINAR UNA FOTO DEL ALBUM
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

def translateT(text,destination):
    return translateText(text,destination,client_translate)

def Compare(profileUser,comparator):
    return Compare_faces(comparator,client_rekognition,get_user(profileUser))


def getPhotoLabels(b64_decode: bytes):
    image = {'Bytes': b64_decode}
    maxLabels = 5
    response = client_rekognition.detect_labels(
        Image=image, MaxLabels=maxLabels
    )
    labels = []
    for label in response['Labels']:
        labels.append(label['Name'])
    print(labels)
    return labels
# def tags(photo):
#     return getTagsProfilePhoto(photo,client_rekognition)


# if __name__ == '__main__':
#     if connectDynamoDB():
#         # get_user('ldecast')
#         pass
