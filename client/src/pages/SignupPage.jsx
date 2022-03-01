import css from '@/styles/SignupPage.module.css'

import { Button, Container, Grid, Input, Text } from '@nextui-org/react'
import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Webcam from 'react-webcam'
import { Link } from 'wouter'

import { passwordRegex, usernameRegex } from '@/constants/REGEX'
import { createUser } from '@/services/userServices'

import camera from '@assets/camera.svg'

function SignupPage() {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const webcamRef = useRef(null)

  const handleStartTakingPhoto = (e) => {
    e.preventDefault()
    setSelectedPhoto('pending')
  }

  const handleTakePhoto = (e) => {
    e.preventDefault()

    const imageSrc = webcamRef.current.getScreenshot()
    setSelectedPhoto(imageSrc)
  }

  const handleSelectPhoto = (e) => {
    e.preventDefault()

    const photoInput = document.createElement('input')
    photoInput.type = 'file'
    // accept jpg
    photoInput.accept = 'image/jpeg'
    photoInput.click()
    photoInput.onchange = () => {
      const file = photoInput.files[0]
      const imageSrc = URL.createObjectURL(file)
      setSelectedPhoto(imageSrc)
    }

  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    const username = data.get('username')
    const password = data.get('password')
    const confirmPassword = data.get('confirmPassword')
    const name = data.get('name')

    if (!username || !password || !confirmPassword || !name)
      return toast.error('Por favor rellena todos los campos')

    if (!usernameRegex.test(username))
      return toast.error('El nombre de usuario debe empezar por una letra y contener al menos 6 caracteres')

    if (password !== confirmPassword)
      return toast.error('Las contraseñas no coinciden')

    if (!passwordRegex.test(password))
      return toast.error('La contraseña debe contener al menos 8 caracteres, una letra y un número')

    const user = {
      user: username,
      password,
      name
    }

    createUser(user)
      .then(({ data }) => {
        toast.success('Login correcto')
        console.log(data)
      })
      .catch(err => {
        toast.error('Usuario o contraseña incorrectos')
        console.log(err)
      })
  }
  return (
    <Grid.Container gap={2} className={css.base} >
      <Grid xs={12} sm={5}>
        <Grid.Container gap={1} alignContent='center'>
          <Grid xs={12} sm={12}>
            <Text h1>Crea una cuenta</Text>
          </Grid>
          <Grid xs={12} sm={12} className={css.photo}>
            {
              selectedPhoto === 'pending' ?
                <Grid.Container gap={2}>
                  <Grid xs={12} sm={12}>
                    <Webcam
                      className={css.camera}
                      ref={webcamRef}
                    />
                  </Grid>
                  <Grid xs={12} justify='center'>
                    <Button
                      auto
                      icon={<img src={camera} />}
                      onClick={handleTakePhoto}
                    />
                  </Grid>
                </Grid.Container>
                : selectedPhoto && <img src={selectedPhoto} alt="foto de perfil" />
            }
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
                    name="username"
                    label="Nombre de usuario *"
                    placeholder="Ingresa un nombre de usuario"
                    helperText="Debe ser único"
                  />
                </Grid>
                <Grid xs={12}>
                  <Input
                    fullWidth
                    required
                    name="name"
                    label="Nombre *"
                    placeholder="Ingresa tu nombre completo"
                  />
                </Grid>
                <Grid xs={12}>
                  <Grid.Container gap={1}>
                    <Grid xs={12}>
                      <Text small>Foto de perfil</Text>
                    </Grid>
                    <Grid xs={6}>
                      <Button
                        color="secondary"
                        onClick={handleStartTakingPhoto}
                      >
                        Tomar una foto
                      </Button>
                    </Grid>
                    <Grid xs={6}>
                      <Button
                        bordered
                        color="secondary"
                        onClick={handleSelectPhoto}
                      >
                        Seleccionar una foto
                      </Button>
                    </Grid>
                  </Grid.Container>
                </Grid>
                <Grid xs={12}>
                  <Input.Password
                    fullWidth
                    required
                    name="password"
                    label="Contraseña *"
                    placeholder="Ingresa tu contraseña"
                  />
                </Grid>
                <Grid xs={12}>
                  <Input.Password
                    fullWidth
                    required
                    name="passwordConfirm"
                    placeholder="Confirma tu contraseña"
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
                  <Button type="submit">Crear cuenta</Button>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Link to="/login">
                    <Button bordered color="gradient">¿Ya tienes una cuenta?</Button>
                  </Link>
                </Grid>
              </Grid.Container>
            </Grid>
          </Grid.Container>
        </form>
      </Grid>
    </Grid.Container >
  )
}

export default SignupPage
