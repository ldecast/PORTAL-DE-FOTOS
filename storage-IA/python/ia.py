
client_rekognition = None
client_translate = None


# OBTENER LAS ETIQUETAS DE UNA FOTO
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


# EXTRAER TEXTO DE UNA FOTO
def extractText(b64_decode: bytes):
    image = {'Bytes': b64_decode}
    response = client_rekognition.detect_text(
        Image=image
    )
    textDetections = response['TextDetections']
    text = ''
    for detection in textDetections:
        if detection['Type'] == 'LINE':
            text += detection['DetectedText'] + '\n'
        elif detection['Type'] == 'WORD' and not 'ParentId' in detection:
            text += detection['DetectedText'] + ' '
        # print('Detected text:' + detection['DetectedText'])
        # print('Confidence: ' + "{:.2f}".format(detection['Confidence']) + "%")
        # print('Id: {}'.format(detection['Id']))
        # if 'ParentId' in detection:
        #     print('Parent Id: {}'.format(detection['ParentId']))
        # print('Type:' + detection['Type'])
        # print()
    print('Detected text:\n' + text)
    return text


# TRADUCIR UN TEXTO CUALQUIERA EN OTRO IDIOMA
def translateText(input: str, target_language: str):
    try:
        response = client_translate.translate_text(
            Text=input,
            # TerminologyNames=['string',],
            SourceLanguageCode='auto',
            # https://docs.aws.amazon.com/comprehend/latest/dg/how-languages.html
            TargetLanguageCode=target_language,
            # Settings={'Formality': 'FORMAL' | 'INFORMAL', 'Profanity': 'MASK'}
        )
        output = response['TranslatedText']
        print('TranslatedText:\n' + output)
        return output
    except Exception as e:
        print(e)
        return 'El texto no puede ser traducido, intente de nuevo.'
