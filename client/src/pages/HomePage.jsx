import { Button, Grid, Input, Text } from '@nextui-org/react'
import { useAtom } from 'jotai'

import Photo from '@/components/Photo'
import { emptyUser, userAtom } from '@/state'
import css from '@/styles/HomePage.module.css'

function HomePage() {
  const [User, setUser] = useAtom(userAtom)
  const { user, name, photo } = User

  const handleLogout = () => {
    localStorage.removeItem('faunaToken')
    const newUser = { ...emptyUser, isLoggedIn: false }
    setUser(newUser)
  }

  return (
    <Grid.Container gap={2} className={css.base}>
      <Grid xs={12}>
        <Grid.Container gap={2} className={css.header}>
          <Grid xs={8} sm={10}>
            <Text h1>Datos personales</Text>
          </Grid>
          <Grid xs={4} sm={2}>
            <Button color='error' type='button' onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </Grid>
        </Grid.Container>
      </Grid>
      <Grid xs={12}>
        <Grid.Container gap={2}>
          <Grid xs={4} className={css.photo}>
            <Grid.Container gap={1}>
              <Grid xs={12} className={css.photo}>
                <Photo {...photo} />
              </Grid>
              <Grid xs={12} className={css.photo} style={{ justifyContent: 'center' }}>
                {photo?.tags?.join(', ')}
              </Grid>
            </Grid.Container>
          </Grid>
          <Grid xs={8}>
            <Grid.Container gap={2}>
              <Grid xs={12}>
                <Input
                  fullWidth
                  required
                  readOnly
                  id='user'
                  name='user'
                  label='Nombre de usuario'
                  value={user}
                />
              </Grid>
              <Grid xs={12}>
                <Input
                  fullWidth
                  required
                  readOnly
                  id='name'
                  name='name'
                  label='Nombre completo'
                  value={name}
                />
              </Grid>
            </Grid.Container>
          </Grid>
        </Grid.Container>
      </Grid>
    </Grid.Container>
  )
}

export default HomePage
