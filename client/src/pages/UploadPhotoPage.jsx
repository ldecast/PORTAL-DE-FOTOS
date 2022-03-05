import camera from '@assets/camera.svg'
import { Button, Grid, Input, Text } from '@nextui-org/react'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { toast } from 'react-toastify'
import Webcam from 'react-webcam'

import Select from '@/components/Select'
import { filterBase64 } from '@/helpers/base64'
import usePhoto from '@/hooks/usePhoto'
import { uploadPhoto } from '@/services/photoServices'
import { albumsAtom, userAtom } from '@/state'
import css from '@/styles/UploadPhotoPage.module.css'

function UploadPhotoPage() {
  const [creatingAlbum, setCreatingAlbum] = useState(false)
  const [user, setUser] = useAtom(userAtom)
  const [albums] = useAtom(albumsAtom)

  const {
    selectedPhoto,
    handleStartTakingPhoto,
    handleTakePhoto,
    handleSelectPhoto,
    webcamRef
  } = usePhoto()

  const handleSelectAlbum = (e) => {
    const album = e.target.value
    console.log(album)

    setCreatingAlbum(album === 'Nuevo')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    const name = data.get('name')
    const album = data.get('album')
    const newAlbum = data.get('newAlbum')

    if (!name) return toast.error('Por favor ingresa un nombre para el album')

    if (!selectedPhoto || selectedPhoto === 'pending')
      return toast.error('Por favor toma o selecciona una foto')

    if (creatingAlbum && !newAlbum)
      return toast.error('Por favor ingresa un nombre para el album')

    const photo = {
      photo: {
        name,
        album: (creatingAlbum && newAlbum) || album,
        photo: filterBase64(selectedPhoto)
      }
    }

    uploadPhoto(photo)
      .then(({ data }) => {
        console.log(data)
        setUser({
          ...user,
          photos: [...user.photos, data.photo]
        })
        toast.success('Foto subida correctamente')
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <div className={css.base}>
      <form onSubmit={handleSubmit}>
        <Grid.Container gap={2}>
          <Grid xs={12} sm={12} className={css.photo}>
            {selectedPhoto === 'pending' ? (
              <Grid.Container gap={2}>
                <Grid xs={12} sm={12}>
                  <Webcam className={css.camera} ref={webcamRef} />
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
                <Text small>Álbum</Text>
              </Grid>
              <Grid xs={12}>
                <Select
                  name='album'
                  options={[...albums, 'Nuevo']}
                  onChange={handleSelectAlbum}
                />
              </Grid>
              {creatingAlbum && (
                <Grid xs={12}>
                  <Input
                    fullWidth
                    required
                    id='newAlbum'
                    name='newAlbum'
                    label='Nombre del nuevo álbum'
                    placeholder='Ingresa un nuevo nombre para el álbum'
                  />
                </Grid>
              )}
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
