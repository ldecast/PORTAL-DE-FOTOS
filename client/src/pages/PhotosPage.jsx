import { Grid } from '@nextui-org/react'
import { useAtom } from 'jotai'
import { Link } from 'wouter'

import Photo from '@/components/Photo'
import { albumsAtom, userAtom } from '@/state'
import css from '@/styles/PhotosPage.module.css'

function PhotosPage() {
  const [User] = useAtom(userAtom)
  const [albums] = useAtom(albumsAtom)

  return (
    <Grid.Container gap={2} className={css.base}>
      {albums.map((album, i) => (
        <Grid key={i} xs={12}>
          <Grid.Container gap={2}>
            <Grid xs={12}>
              <h2>{album.name}</h2>
            </Grid>
            {album.photos.map((photo, j) => (
              <Grid key={j} xs={4} sm={3} md={2} lg={2}>
                <Grid.Container>
                  <Grid xs={12}>
                    <Photo {...photo} />
                  </Grid>
                  <Grid xs={12} className={css.name}>
                    <Link to={`photos/${encodeURIComponent(photo.url)}`}>
                      {photo.name}
                    </Link>
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
