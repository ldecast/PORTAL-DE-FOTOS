import { Grid } from '@nextui-org/react'
import { useAtom } from 'jotai'

import Photo from '@/components/Photo'
import { albumsAtom, userAtom } from '@/state'
import css from '@/styles/PhotosPage.module.css'

function PhotosPage() {
  const [User] = useAtom(userAtom)
  const [albums] = useAtom(albumsAtom)
  const { user, photos } = User

  return (
    <Grid.Container gap={2} className={css.base}>
      {albums.map((album, i) => (
        <Grid key={i} xs={12}>
          <Grid.Container gap={2}>
            <Grid xs={12}>
              <h2>{album.name}</h2>
            </Grid>
            {!album.photos.length && (
              <Grid xs={12}>
                <p>No hay fotos en este album</p>
              </Grid>
            )}
            {album.photos.map((photo, j) => (
              <Grid key={j} xs={4} sm={3} md={2} lg={2}>
                <Grid.Container>
                  <Grid xs={12}>
                    <Photo {...photo} />
                  </Grid>
                  <Grid xs={12}>
                    <p>{photo.name}</p>
                  </Grid>
                </Grid.Container>
              </Grid>
            ))}
          </Grid.Container>
        </Grid>
      ))}
    </Grid.Container>
  )
}

export default PhotosPage
