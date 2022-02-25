import css from '@/styles/LoginPage.module.css'

import { Button, Container, Grid, Input, Text } from '@nextui-org/react'
import { Link } from 'wouter'

function LoginPage() {
  return (
    <Grid.Container gap={2} className={css.base}>
      <Grid xs={12} sm={5}>
        <Container>
          <Text h1 css={{ textGradient: '45deg, #66f -20%, #d77 50%' }}>FaunaDex</Text>
          <Text h2>Inicia sesión</Text>
        </Container>
      </Grid>
      <Grid xs={12} sm={7}>
        <form>
          <Grid.Container gap={2}>
            <Grid xs={12}>
              <Grid.Container gap={2}>
                <Grid xs={12}>
                  <Input
                    fullWidth
                    required
                    name="username"
                    label="Usuario"
                    placeholder="Ingresa tu nombre de usuario"
                  />
                </Grid>
                <Grid xs={12}>
                  <Input.Password
                    fullWidth
                    required
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
