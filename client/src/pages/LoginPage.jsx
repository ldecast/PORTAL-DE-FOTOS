import { Button, Container, Grid, Input, Text } from '@nextui-org/react'
import { useAtom } from 'jotai'
import { toast } from 'react-toastify'
import { Link } from 'wouter'

import { loginUser } from '@/services/userServices'
import { emptyUser, userAtom } from '@/state'
import css from '@/styles/LoginPage.module.css'

function LoginPage() {
  const [, setUser] = useAtom(userAtom)

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    const user = data.get('user')
    const password = data.get('password')

    if (!user || !password) return toast.error('Por favor rellena todos los campos')

    const User = {
      user,
      password
    }

    loginUser(User)
      .then((data) => {
        localStorage.setItem('faunaToken', data.token)

        toast.success('Login correcto')

        const newUser = {
          ...data,
          isLoggedIn: true
        }

        setUser(newUser)
      })
      .catch((err) => {
        toast.error('Usuario o contraseña incorrectos')
        console.log(err)
      })
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
        <form onSubmit={handleSubmit}>
          <Grid.Container gap={2}>
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
                <Grid xs={12} sm={6}>
                  <Button type='submit'>Iniciar sesión</Button>
                </Grid>
                <Grid xs={12} sm={6}>
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
