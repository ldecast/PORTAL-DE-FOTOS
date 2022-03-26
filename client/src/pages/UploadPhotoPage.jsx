import camera from '@assets/camera.svg'
import { Button, Container, Grid, Input, Text } from '@nextui-org/react'
import { useAtom } from 'jotai'
import { toast } from 'react-toastify'
import Webcam from 'react-webcam'

import { filterBase64 } from '@/helpers/base64'
import usePhoto from '@/hooks/usePhoto'
import { uploadPhoto } from '@/services/photoServices'
import { userAtom } from '@/state'
import css from '@/styles/UploadPhotoPage.module.css'

function UploadPhotoPage() {
  const [user, setUser] = useAtom(userAtom)

  const {
    selectedPhoto,
    handleStartTakingPhoto,
    handleTakePhoto,
    handleSelectPhoto,
    webcamRef
  } = usePhoto()

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    const name = data.get('name')

    if (!name) return toast.error('Por favor ingresa un nombre para la foto')

    if (!selectedPhoto || selectedPhoto === 'pending')
      return toast.error('Por favor toma o selecciona una foto')

    const photo = {
      photo: {
        name,
        photo: filterBase64(selectedPhoto)
      }
    }

    uploadPhoto(photo)
      .then(() => {
        const newPhoto = photo.photo

        setUser({
          ...user,
          photos: [...user.photos, newPhoto]
        })

        toast.success('Foto subida correctamente')
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
              <Text h1>Sube una foto</Text>
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
                    icon={<img src={camera} alt='foto de perfil' />}
                    onClick={handleTakePhoto}
                  />
                </Grid>
              </Grid.Container>
            ) : (
              selectedPhoto && <img src={selectedPhoto} alt='foto de perfil' />
            )}
          </Grid>
          <Grid xs={12}>
            <Grid.Container gap={1}>
              <Grid xs={12}>
                <Text small>Nombre</Text>
              </Grid>
              <Grid xs={12}>
                <Input
                  fullWidth
                  required
                  id='name'
                  name='name'
                  label='Nombre de la foto'
                  placeholder='Ingresa un nombre para la foto'
                />
              </Grid>
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
                <Button type='submit'>Subir foto</Button>
              </Grid>
            </Grid.Container>
          </Grid>
        </Grid.Container>
      </form>
    </div>
  )
}

export default UploadPhotoPage
