import camera from '@assets/camera.svg'
import { useState } from 'react'
import { Button, Container, Grid, Text } from '@nextui-org/react'
import { toast } from 'react-toastify'
import Webcam from 'react-webcam'

import { filterBase64 } from '@/helpers/base64'
import usePhoto from '@/hooks/usePhoto'
import css from '@/styles/UploadPhotoPage.module.css'
import { extractText } from '@/services/variousServices'

function ExtractPhotoPage() {
  const [extractedText, setExtractedText] = useState('')

  const {
    selectedPhoto,
    handleStartTakingPhoto,
    handleTakePhoto,
    handleSelectPhoto,
    webcamRef
  } = usePhoto()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedPhoto || selectedPhoto === 'pending')
      return toast.error('Por favor toma o selecciona una foto')

    extractText(filterBase64(selectedPhoto))
      .then((text) => {
        setExtractedText(text)
      })
      .catch((err) => {
        toast.error('Error al subir la foto')
        console.log(err)
      })
  }

  return (
    <div className={css.base}>
      <form onSubmit={handleSubmit}>
        <Grid.Container gap={2}>
          <Grid xs={12}>
            <Container>
              <Text h1>Extraer texto de una foto</Text>
            </Container>
          </Grid>
          <Grid xs={12} sm={12} className={css.photo}>
            {selectedPhoto === 'pending' ? (
              <Grid.Container gap={2}>
                <Grid xs={12} sm={12}>
                  <Webcam
                    className={css.camera}
                    ref={webcamRef}
                    screenshotFormat='image/png'
                  />
                </Grid>
                <Grid xs={12} justify='center'>
                  <Button
                    auto
                    icon={<img src={camera} alt='foto a extraer' />}
                    onClick={handleTakePhoto}
                  />
                </Grid>
              </Grid.Container>
            ) : (
              selectedPhoto && <img src={selectedPhoto} alt='foto a extraer' />
            )}
          </Grid>
          <Grid xs={12}>
            <Grid.Container gap={1}>
              <Grid xs={12}>
                <Text small>Foto</Text>
              </Grid>
              <Grid xs={6}>
                <Button color='secondary' onClick={handleStartTakingPhoto}>
                  Tomar una foto
                </Button>
              </Grid>
              <Grid xs={6}>
                <Button bordered color='secondary' onClick={handleSelectPhoto}>
                  Seleccionar una foto
                </Button>
              </Grid>
              <Grid xs={12} sm={6}>
                <Button type='submit'>Extraer texto</Button>
              </Grid>
              <Grid xs={12} style={{ marginTop: 30 }}>
                <Text>{extractedText}</Text>
              </Grid>
            </Grid.Container>
          </Grid>
        </Grid.Container>
      </form>
    </div>
  )
}

export default ExtractPhotoPage
