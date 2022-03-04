import { Button, Grid, Input } from '@nextui-org/react'

import Photo from '@/components/Photo'
import css from '@/styles/UploadPhotoPage.module.css'

function UploadPhotoPage() {
  const [User, setUser] = useAtom(userAtom)
  const { user, name, password, photo } = User

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    const user = data.get('user')
    const name = data.get('name')
    const password = data.get('password')

    if (!user || !name) {
      setEditing(false)
      return toast.error('Nada que actualizar')
    }

    if (!password) return toast.error('Por favor ingresa tu contraseña')

    const newUser = {
      name,
      user,
      password
    }

    updateUser(newUser)
      .then(({ data }) => {
        setEditing(false)
        console.log(data)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <div className={css.base}>
      <form onSubmit={handleSubmit}>
        <Grid.Container gap={2}>
          <Grid xs={12} sm={4} className={css.photo}>
            <Photo {...photo} />
          </Grid>
          <Grid xs={12} sm={8}>
            <Grid.Container gap={2}>
              <Grid xs={12} sm={6}>
                <Input
                  fullWidth
                  required
                  id='user'
                  name='user'
                  label='Nombre de usuario'
                  placeholder={user}
                  helperText='Debe ser único'
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <Input
                  fullWidth
                  required
                  id='name'
                  name='name'
                  label='Nombre completo'
                  placeholder={name}
                />
              </Grid>
              <Grid xs={12}>
                <Input.Password
                  fullWidth
                  required
                  id='password'
                  name='password'
                  label='Contraseña'
                  placeholder='Es necesaria para confirmar los cambios'
                />
              </Grid>
              <Grid xs={12}>
                <Button type='submit' color={'success'}>
                  Confirmar
                </Button>
              </Grid>
            </Grid.Container>
          </Grid>
        </Grid.Container>
      </form>
    </div>
  )
}

export default UploadPhotoPage
