import camera from '@assets/camera.svg'
import { Button, Container, Grid, Input, Text } from '@nextui-org/react'
import { useAtom } from 'jotai'
import { toast } from 'react-toastify'
import Webcam from 'react-webcam'
import { useLocation } from 'wouter'

import { filterBase64 } from '@/helpers/base64'
import usePhoto from '@/hooks/usePhoto'
import { updateUser } from '@/services/userServices'
import { emptyUser } from '@/state'
import { userAtom } from '@/state'
import css from '@/styles/UpdateUserPage.module.css'

function UpdateUserPage() {
  const [location, setLocation] = useLocation()
  const [User, setUser] = useAtom(userAtom)
  const { user, name, password, photo } = User

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
    const user = data.get('user')
    const name = data.get('name')
    const password = data.get('password')

    if (!user && !name && !selectedPhoto) {
      return toast.error('Nada que actualizar')
    }

    if (!password) return toast.error('Por favor ingresa tu contraseña')

    const newUser = {
      name,
      user,
      password,
      photo: filterBase64(selectedPhoto)
    }

    updateUser(newUser)
      .then(({ data }) => {
        toast.success('Usuario actualizado, por favor inicia sesión nuevamente')

        const newUser = {
          ...emptyUser,
          isLoggedIn: false
        }

        setUser(newUser)
        setLocation('/')
      })
      .catch((err) => {
        toast.error('Error al actualizar usuario')
        console.log(err)
      })
  }

  return (
    <div className={css.base}>
      <Grid xs={12}>
        <Container>
          <Text h1>Edita tu perfil</Text>
        </Container>
      </Grid>
      <Grid xs={12}>
        <form autoComplete='off' onSubmit={handleSubmit}>
          <Grid.Container gap={2}>
            <Grid xs={12} sm={4} className={css.photo}>
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
                  <Text small>Foto de perfil</Text>
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
              </Grid.Container>
            </Grid>
            <Grid xs={12} sm={8}>
              <Grid.Container gap={2}>
                <Grid xs={12} sm={6}>
                  <Input
                    autoComplete='off'
                    fullWidth
                    required
                    id='user'
                    name='user'
                    label='Nombre de usuario'
                    placeholder={user}
                    helperText='Debe ser único'
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Input
                    autoComplete='off'
                    fullWidth
                    required
                    id='name'
                    name='name'
                    label='Nombre completo'
                    placeholder={name}
                  />
                </Grid>
                <Grid xs={12}>
                  <Input.Password
                    autoComplete='off'
                    fullWidth
                    required
                    id='password'
                    name='password'
                    label='Contraseña'
                    placeholder='Es necesaria para confirmar los cambios'
                  />
                </Grid>
                <Grid xs={12}>
                  <Button type='submit' color={'success'}>
                    Confirmar
                  </Button>
                </Grid>
              </Grid.Container>
            </Grid>
          </Grid.Container>
        </form>
      </Grid>
    </div>
  )
}

export default UpdateUserPage
