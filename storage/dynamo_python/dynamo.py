from objects.user import UserDB
import boto3  # pip install boto3
from dotenv import load_dotenv
import os

load_dotenv()

ACCESS_KEY_ID = os.getenv('ACCESS_KEY_ID')
SECRET_ACCESS_KEY = os.getenv('SECRET_ACCESS_KEY')
REGION_NAME = os.getenv('REGION_NAME')

client_dynamodb = None

table_users = {
    'Name': 'Users',
    'Attributes': ['Username', 'Password', 'FullName']
}

table_photos = {
    'Name': 'Photos',
    'Attributes': ['AlbumName', 'Username', 'PhotoURL']
}


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


# REGISTRAR UN USUARIO
def add_user(username: str, password: str, fullname: str) -> bool:
    item = {
        'Username': {'S': username},
        'Password': {'S': password},
        'FullName': {'S': fullname}
    }
    # TODO agregar la foto de perfil a S3 en album default
    try:
        print("Adding user:", item)
        client_dynamodb.put_item(TableName=table_users['Name'], Item=item)
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
    photos = client_dynamodb.get_item(TableName=table_photos['Name'], Key=key)
    photos_db = client_dynamodb.scan(
        TableName=table_photos['Name'], FilterExpression='Username=:name', ExpressionAttributeValues={":name": key['Username']})
    for photo in photos_db['Items']:
        url = photo['PhotoURL']['S']
        albumName = photo['AlbumName']['S']
        user_response.addPhoto(url, albumName)
    # print(user_response)
    return user_response


if __name__ == '__main__':
    if connectDynamoDB():
        # get_user('ldecast', '1234')
        pass
