import boto3  # pip install boto3
from dotenv import load_dotenv
import dynamo_s3
import ia
import os
import base64

load_dotenv()

ACCESS_KEY_ID = os.getenv('ACCESS_KEY_ID')
SECRET_ACCESS_KEY = os.getenv('SECRET_ACCESS_KEY')
REGION_NAME = os.getenv('REGION_NAME')


def connect_AWS_Services() -> bool:
    try:
        # CONECTAR A LA BASE DE DATOS
        dynamo_s3.client_dynamodb = boto3.client('dynamodb',
                                                 aws_access_key_id=ACCESS_KEY_ID,
                                                 aws_secret_access_key=SECRET_ACCESS_KEY,
                                                 region_name=REGION_NAME)
        # CONECTAR A BUCKET S3 DE IMAGENES
        dynamo_s3.client_s3 = boto3.client('s3',
                                           aws_access_key_id=ACCESS_KEY_ID,
                                           aws_secret_access_key=SECRET_ACCESS_KEY,
                                           region_name=REGION_NAME)
        # CONECTAR A REKOGNITION
        ia.client_rekognition = boto3.client('rekognition',
                                             aws_access_key_id=ACCESS_KEY_ID,
                                             aws_secret_access_key=SECRET_ACCESS_KEY,
                                             region_name=REGION_NAME)

        # CONECTAR A TRANSLATE
        ia.client_translate = boto3.client('translate',
                                           aws_access_key_id=ACCESS_KEY_ID,
                                           aws_secret_access_key=SECRET_ACCESS_KEY,
                                           region_name=REGION_NAME)
    except:
        print("Something went wrong connecting with AWS Services")
        return False
    else:
        print("AWS Services running!")
        return True


def getBase64(path: str) -> str:
    text_file = open(path, "r")
    data = text_file.read()
    text_file.close()
    return data


if __name__ == '__main__':
    if connect_AWS_Services():
        # dynamo_s3.add_user("luisd", "0000", "Luis Danniel Castellanos",
        #                    getBase64('../testing/perfil1.txt'), "img1.jpg")
        # dynamo_s3.updateUser("luisd", "0000", "ldecast", "Luis Danniel Ernesto Castellanos Galindo")
        # dynamo_s3.uploadPhoto('luisd', getBase64(
        #     '../testing/sistemas.txt'), 'Sistemas.jpg', 'Pensum de sistemas')
        # dynamo_s3.updateProfilePhoto("luisd", getBase64('../testing/perfil2.txt'), 'img2.jpg')
        # dynamo_s3.add_user("luisd", "1234", "LuisDa", getBase64('../testing/perfil1.txt'), "hola.jpg")
        dynamo_s3.deletePhoto('ldecast','Fotos_Perfil/ldecast/img1.jpg')
        # dynamo_s3.get_user('ldecast')

        # b64_decode = base64.b64decode(getBase64('../testing/texto3.txt'))
        # ia.getPhotoLabels(b64_decode)
        # ia.extractText(b64_decode)
        # ia.translateText('Hola mundo', 'fr')
        pass
