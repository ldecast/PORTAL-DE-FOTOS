import css from '@/styles/HomePage.module.css'

import { Button, Container, Grid, Input, Text } from '@nextui-org/react'

function HomePage() {
  return (
    <Grid.Container gap={2} className={css.base} >
      <Grid xs={12} sm={5}>
        <Container>
          <Text h1>Página de inicio</Text>
        </Container>
      </Grid>
      <Grid xs={12} sm={7}>
        <Grid.Container gap={2}>
          <Grid xs={12}>
            <Grid.Container gap={2}>
              <Grid xs={12}>
                <Input fullWidth placeholder="Usuario" />
              </Grid>
              <Grid xs={12}>
                <Input.Password fullWidth placeholder="Contraseña" />
              </Grid>
            </Grid.Container>
          </Grid>
          <Grid xs={12}>
            <Grid.Container gap={2} className={css.buttons}>
              <Grid xs={12} sm={6}>
                <Button type="submit">Iniciar sesión</Button>
              </Grid>
              <Grid xs={12} sm={6}>
                <Button bordered color="gradient">Crear cuenta</Button>
              </Grid>
            </Grid.Container>
          </Grid>
        </Grid.Container>
      </Grid>
    </Grid.Container>
  )
}

export default HomePage
