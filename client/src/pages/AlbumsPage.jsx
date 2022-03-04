import { Button, Grid, Input, Text } from '@nextui-org/react'
import { useAtom } from 'jotai'

import Photo from '@/components/Photo'
import { updateUser } from '@/services/userServices'
import { emptyUser, userAtom } from '@/state'
import css from '@/styles/AlbumsPage.module.css'

function AlbumsPage() {
  const [User, setUser] = useAtom(userAtom)
  const { user, name } = User

  const handleLogout = () => {
    localStorage.removeItem('faunaToken')
    const newUser = { ...emptyUser, isLoggedIn: false }
    setUser(newUser)
  }

  return (
    <Grid.Container gap={2} className={css.base}>
      <Grid xs={12}>
        <Grid.Container gap={2} className={css.header} alignItems='center'>
          <Grid xs={8}>
            <Text h1>Datos personales</Text>
          </Grid>
          <Grid xs={4}>
            <Button bordered color='error' type='button' onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </Grid>
        </Grid.Container>
      </Grid>
      <Grid xs={12}>
        <Grid.Container gap={2}>
          <Grid xs={12} sm={6}>
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
          <Grid xs={12} sm={6}>
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
  )
}

export default AlbumsPage
