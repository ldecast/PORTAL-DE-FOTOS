import { Button, Grid, Input } from '@nextui-org/react'

import Photo from '@/components/Photo'
import css from '@/styles/UploadPhotoPage.module.css'
import camera from '@assets/camera.svg'
import { Button, Container, Grid, Input, Text } from '@nextui-org/react'
import { toast } from 'react-toastify'
import { useAtom } from 'jotai'
import Webcam from 'react-webcam'
import { Link, useLocation } from 'wouter'
import {emptyUser} from '@/state'

import { filterBase64 } from '@/helpers/base64'
import Photo from '@/components/Photo'
import usePhoto from '@/hooks/usePhoto'
import { userAtom } from '@/state'
import css from '@/styles/UpdateUserPage.module.css'
import { updateUser } from '@/services/userServices'


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
