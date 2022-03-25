import base64
import string


def Compare_faces(comparator:string,rekognitionClient,userData) -> bool:
    try:
        imageSource={"S3Object": {
                "Bucket": "practica1.g10.imagenes",
                "Name": ""
            }}
        # varificar que el usuario exista
        if not userData:
            return False
        # varificar que tenga foto de perfil
        elif userData.getProfilePhoto() is None:
            return False

        imageSource["S3Object"]["Name"] = userData.getProfilePhoto().getUrl()
        print(imageSource)

        resRekognition = rekognitionClient.compare_faces(
                                  SourceImage=imageSource,
                                  TargetImage={'Bytes': base64.decodebytes(comparator)})
        for face in resRekognition["FaceMatches"]:
            similarity = face["Similarity"]
            if similarity > 30:
                return True
        print("NO se encontraron similitudes")
        return False
    except Exception as e:
        print(str(e))
        return False

def getTagsProfilePhoto(profilePhoto,client_rekognition):
    if profilePhoto is None or profilePhoto == "":
        return []
    try:
        resRekognition = client_rekognition.detect_faces(Attributes=["ALL"],Image={'Bytes': base64.b64decode(profilePhoto)})
        # responseAnalysis = {"ageMax":0,"ageMin":0,"beard":False,"gender":"","emotion":"","smile":False,"sunglases":False,"mustache":False}
        if len(resRekognition["FaceDetails"]) < 1:
            print("No se reconocio ningun rostro")
            return [""]
        details = resRekognition["FaceDetails"][-1]
        aux = []
        aux.append(str(details["AgeRange"]["High"]))
        aux.append(str(details["AgeRange"]["Low"]))
        if details["Beard"]["Value"]: aux.append("Con barba")
        else: aux.append("Sin barba")
        aux.append(str(details["Gender"]["Value"]))
        if details["Smile"]["Value"]: aux.append("Con Sonrrisa")
        else: aux.append("Sin Sonrrisa")
        if details["Sunglasses"]["Value"]: aux.append("Con lentes de sol")
        else: aux.append("Sin lentes de sol")
        if details["Mustache"]["Value"]: aux.append("Con vigote")
        else: aux.append("Sin vigote")
        aux.append(bubbleSort(details["Emotions"]))
        print(aux)
        return aux
    except Exception as e:
        print(str(e))
        return [""]

def get_confidence(emotion):
    return emotion.get("Confidence")

def bubbleSort(arr):
    n = len(arr)
    for i in range(n-1):
        for j in range(0, n-i-1):
            if arr[j]["Confidence"] < arr[j + 1]["Confidence"] :
                arr[j]["Confidence"], arr[j + 1]["Confidence"] = arr[j + 1]["Confidence"], arr[j]["Confidence"]
    aux = []
    for item in arr:
        aux.append(item["Type"])
    return aux[0]

def translateText(text,destination,client_translate):
    try:

        result = client_translate.translate_text(Text=text,Settings={'Formality': 'INFORMAL'},SourceLanguageCode="auto",TargetLanguageCode= destination)
        if result["TranslatedText"] is not None:
            return result["TranslatedText"]
        return None
    except Exception as e:
        print(str(e))
        print("Ocurrio un error traducir")
        return None