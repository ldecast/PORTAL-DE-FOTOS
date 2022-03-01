import css from '@/styles/LoginPage.module.css'
import { Button, Container, Grid, Input, Text } from '@nextui-org/react'
import { useAtom } from 'jotai'
import { toast } from 'react-toastify'
import { Link } from 'wouter'

import { userAtom } from '@/state'
import { loginUser } from '@/services/userServices'

function LoginPage() {
  const [, setUser] = useAtom(userAtom)

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    const username = data.get('username')
    const password = data.get('password')

    if (!username || !password)
      return toast.error('Por favor rellena todos los campos')

    const user = {
      user: username,
      password
    }

    loginUser(user)
      .then(({ data }) => {
        toast.success('Login correcto')
        console.log(data)
        setUser(data)
      })
      .catch(err => {
        toast.error('Usuario o contraseña incorrectos')
        console.log(err)
      })
  }

  return (
    <Grid.Container gap={2} className={css.base}>
      <Grid xs={12} sm={5}>
        <Container>
          <Text h1 css={{ textGradient: '45deg, #66f -20%, #d77 50%' }}>FaunaDex</Text>
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
                    id="username"
                    name="username"
                    label="Usuario"
                    placeholder="Ingresa tu nombre de usuario"
                  />
                </Grid>
                <Grid xs={12}>
                  <Input.Password
                    fullWidth
                    required
                    id="password"
                    name="password"
                    label="Contraseña"
                    placeholder="Ingresa tu contraseña"
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
                  <Button type="submit">Iniciar sesión</Button>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Link to="/signup">
                    <Button bordered color="gradient">¿No tienes una cuenta?</Button>
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

export default LoginPage
