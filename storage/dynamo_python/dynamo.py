import base64
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
    'Attributes': ['AlbumName', 'Username', 'PhotoURL']
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
def add_user(username: str, password: str, fullname: str, profile_photo: str) -> bool:
    item = {
        'Username': {'S': username},
        'Password': {'S': password},
        'FullName': {'S': fullname}
    }
    url = "Fotos_Perfil/"+username+"/actual.jpg"
    b64_decode = base64.b64decode(profile_photo)
    try:
        print("Adding user:", item)
        client_dynamodb.put_item(TableName=table_users['Name'], Item=item)
        client_s3.upload_fileobj(io.BytesIO(b64_decode), bucket_name, url,
                                 ExtraArgs={'ContentType': "image"})
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


# OBTENER UN USUARIO
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


# SUBIR FOTO A ALBUM DE USUARIO
def uploadPhoto(username: str, albumName: str, profile_photo: str, filename: str):
    url = "Fotos_Publicadas/"+username+"/"+albumName+"/"+filename
    b64_decode = base64.b64decode(profile_photo)
    client_s3.upload_fileobj(io.BytesIO(b64_decode), bucket_name, url,
                             ExtraArgs={'ContentType': "image"})
    print("Upload Successful")


if __name__ == '__main__':
    if connectDynamoDB():
        # get_user('ldecast', '1234')
        pass
