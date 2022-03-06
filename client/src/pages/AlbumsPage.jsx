import { Button, Container, Grid, Text } from '@nextui-org/react'
import { useAtom } from 'jotai'
import { toast } from 'react-toastify'

import Select from '@/components/Select'
import { deleteAlbum } from '@/services/albumServices'
import { albumsAtom } from '@/state'
import css from '@/styles/AlbumsPage.module.css'

function AlbumsPage() {
  const [albums, setAlbums] = useAtom(albumsAtom)

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    const album = data.get('album')

    if (!album) return toast.error('Por favor selecciona un álbum a eliminar')

    deleteAlbum(album)
      .then(() => {
        const newAlbums = albums.filter((a) => a !== album)

        setAlbums(newAlbums)
        toast.success('Álbum eliminado exitosamente')
      })
      .catch((err) => {
        console.log(err)
        toast.error('Error al eliminar el álbum')
      })
  }

  const filteredAlbums = albums.filter((album) => album !== 'Fotos de Perfil')

  return (
    <div className={css.base}>
      <form onSubmit={handleSubmit}>
        <Grid.Container gap={3}>
          <Grid xs={12}>
            <Container>
              <Text h1>Edita tus álbumes</Text>
            </Container>
          </Grid>
          <Grid xs={12}>
            <Text small>Álbum</Text>
          </Grid>
          <Grid xs={12}>
            <Select name='album' options={filteredAlbums} />
          </Grid>
          <Grid xs={12} sm={6}>
            <Button type='submit' color='error'>
              Eliminar álbum
            </Button>
          </Grid>
        </Grid.Container>
      </form>
    </div>
  )
}

export default AlbumsPage
