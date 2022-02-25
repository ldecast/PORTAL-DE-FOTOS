import css from '@/styles/SignupPage.module.css'

import { Button, Container, Grid, Input, Text } from '@nextui-org/react'
import { Link } from 'wouter'

function SignupPage() {
  return (
    <Grid.Container gap={2} className={css.base} >
      <Grid xs={12} sm={5}>
        <Container>
          <Text h1>Crea una cuenta</Text>
        </Container>
      </Grid>
      <Grid xs={12} sm={7}>
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
                    <Button color="secondary">Tomar una foto</Button>
                  </Grid>
                  <Grid xs={6}>
                    <Button bordered color="secondary">Seleccionar una foto</Button>
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
            <Grid.Container gap={2} className={css.buttons}>
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
      </Grid>
    </Grid.Container >
  )
}

export default SignupPage
