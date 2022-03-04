import camera from '@assets/camera.svg'
import { Button, Container, Grid, Input, Text } from '@nextui-org/react'
import { toast } from 'react-toastify'
import Webcam from 'react-webcam'
import { Link, useLocation } from 'wouter'

import { passwordRegex, usernameRegex } from '@/constants/REGEX'
import { filterBase64 } from '@/helpers/base64'
import usePhoto from '@/hooks/usePhoto'
import { createUser } from '@/services/userServices'
import css from '@/styles/SignupPage.module.css'

function SignupPage() {
  const {location, setLocation} = useLocation()

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
    const password = data.get('password')
    const confirmPassword = data.get('confirmPassword')
    const name = data.get('name')
    console.log(selectedPhoto)

    if (!selectedPhoto || selectedPhoto === 'pending')
      return toast.error('Por favor toma una foto')

    if (!user || !password || !confirmPassword || !name)
      return toast.error('Por favor rellena todos los campos')

    if (!usernameRegex.test(user))
      return toast.error(
        'El nombre de usuario debe empezar por una letra y contener al menos 6 caracteres'
      )

    if (password !== confirmPassword) return toast.error('Las contraseñas no coinciden')

    if (!passwordRegex.test(password))
      return toast.error(
        'La contraseña debe contener al menos 8 caracteres, una letra y un número'
      )

    const User = {
      user,
      password,
      name,
      photo: filterBase64(selectedPhoto)
    }

    createUser(User)
      .then(({ data }) => {
        toast.success('Registrado correctamente')
        setLocation('/login')
      })
      .catch((err) => {
        toast.error('Hubo un error en el registro')
        console.log(err)
      })
  }

  return (
    <Grid.Container gap={2} className={css.base}>
      <Grid xs={12} sm={5}>
        <Grid.Container gap={1} alignContent='center'>
          <Grid xs={12} sm={12}>
            <Text h1>Crea una cuenta</Text>
          </Grid>
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
        </Grid.Container>
      </Grid>
      <Grid xs={12} sm={7}>
        <form onSubmit={handleSubmit}>
          <Grid.Container gap={2}>
            <Grid xs={12}>
              <Grid.Container gap={3}>
                <Grid xs={12}>
                  <Input
                    fullWidth
                    required
                    id='user'
                    name='user'
                    label='Nombre de usuario *'
                    placeholder='Ingresa un nombre de usuario'
                    helperText='Debe ser único'
                  />
                </Grid>
                <Grid xs={12}>
                  <Input
                    fullWidth
                    required
                    id='name'
                    name='name'
                    label='Nombre *'
                    placeholder='Ingresa tu nombre completo'
                  />
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
                <Grid xs={12}>
                  <Input.Password
                    fullWidth
                    required
                    name='password'
                    label='Contraseña *'
                    placeholder='Ingresa tu contraseña'
                  />
                </Grid>
                <Grid xs={12}>
                  <Input.Password
                    fullWidth
                    required
                    name='confirmPassword'
                    placeholder='Confirma tu contraseña'
                  />
                </Grid>
              </Grid.Container>
            </Grid>
            <Grid xs={12}>
              <Container>
                <Text small>* Campos requeridos</Text>
              </Container>
            </Grid>
            <Grid xs={12}>
              <Grid.Container gap={2}>
                <Grid xs={12} sm={6}>
                  <Button type='submit'>Crear cuenta</Button>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Link to='/login'>
                    <Button bordered color='gradient'>
                      ¿Ya tienes una cuenta?
                    </Button>
                  </Link>
                </Grid>
              </Grid.Container>
            </Grid>
          </Grid.Container>
        </form>
      </Grid>
    </Grid.Container>
  )
}

export default SignupPage
