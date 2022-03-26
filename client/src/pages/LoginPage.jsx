import camera from '@assets/camera.svg'
import { useRef } from 'react'
import { Button, Container, Grid, Input, Text } from '@nextui-org/react'
import { useAtom } from 'jotai'
import { toast } from 'react-toastify'
import Webcam from 'react-webcam'
import { Link } from 'wouter'
import { filterBase64 } from '@/helpers/base64'

import { loginUser } from '@/services/userServices'
import { emptyUser, userAtom } from '@/state'
import css from '@/styles/LoginPage.module.css'
import usePhoto from '@/hooks/usePhoto'

function LoginPage() {
  const formRef = useRef(null)

  const [, setUser] = useAtom(userAtom)
  const { takingPhoto, handleStartTakingPhoto, handleTakePhoto, webcamRef } = usePhoto()

  const handleLogin = (photo) => {
    const data = new FormData(formRef.current)
    const user = data.get('user')
    const password = data.get('password')

    if (!user || !password) return toast.error('Por favor rellena todos los campos')

    const User = {
      user,
      password: '',
      photo: ''
    }

    if (typeof photo === 'string') User.photo = filterBase64(photo)
    else User.password = password

    loginUser(User)
      .then((data) => {
        localStorage.setItem('faunaToken', data.token)

        toast.success('Login correcto')

        const newUser = {
          ...emptyUser,
          isLoggedIn: true
        }

        setUser(newUser)
      })
      .catch((err) => {
        toast.error(
          User.photo ? 'Error al reconocer el rostro' : 'Usuario o contraseña incorrectos'
        )
        console.log(err)
      })
  }

  const handleStartFaceRecognition = () => {
    const data = new FormData(formRef.current)
    const user = data.get('user')
    if (!user) return toast.error('Por favor ingresa tu usuario antes')

    handleStartTakingPhoto()
  }

  const handleLoginWithFaceRecognition = () => {
    handleTakePhoto().then(handleLogin)
  }

  return (
    <Grid.Container gap={2} className={css.base}>
      <Grid xs={12} sm={5}>
        <Container>
          <Text h1 css={{ textGradient: '30deg, #66f -20%, #d77 50%' }}>
            FaunaDex
          </Text>
          <Text h2>Inicia sesión</Text>
        </Container>
      </Grid>
      <Grid xs={12} sm={7}>
        <form ref={formRef}>
          <Grid.Container gap={2}>
            {takingPhoto && (
              <Grid.Container gap={2} className={css.modal}>
                <Grid xs={12} sm={12}>
                  <Webcam
                    className={css.camera}
                    ref={webcamRef}
                    screenshotFormat='image/png'
                  />
                </Grid>
                <Grid.Container xs={12} justify='center'>
                  <Button
                    type='button'
                    auto
                    icon={<img src={camera} alt='foto de perfil' />}
                    onClick={handleLoginWithFaceRecognition}
                  />
                </Grid.Container>
              </Grid.Container>
            )}
            <Grid xs={12}>
              <Grid.Container gap={2}>
                <Grid xs={12}>
                  <Input
                    fullWidth
                    required
                    id='user'
                    name='user'
                    label='Usuario'
                    placeholder='Ingresa tu nombre de usuario'
                  />
                </Grid>
                <Grid xs={12}>
                  <Input.Password
                    fullWidth
                    required
                    id='password'
                    name='password'
                    label='Contraseña'
                    placeholder='Ingresa tu contraseña'
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
              <Grid.Container gap={2} className={css.buttons}>
                <Grid xs={12} sm={6} onClick={handleLogin}>
                  <Button type='button'>Iniciar sesión</Button>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Button type='button' onClick={handleStartFaceRecognition}>
                    Reconocimiento facial
                  </Button>
                </Grid>
                <Grid xs={12}>
                  <Link to='/signup'>
                    <Button bordered color='gradient'>
                      ¿No tienes una cuenta?
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

export default LoginPage
