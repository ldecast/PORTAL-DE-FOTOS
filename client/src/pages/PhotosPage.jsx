import { Grid } from '@nextui-org/react'
import { useAtom } from 'jotai'

import Photo from '@/components/Photo'
import { userAtom } from '@/state'
import css from '@/styles/PhotosPage.module.css'

function PhotosPage() {
  const [User] = useAtom(userAtom)
  const { user, photos } = User

  return (
    <Grid.Container gap={2} className={css.base}>
      {photos.map((photo) => (
        <Grid key={photo.name} xs={12}>
          <p>{photo.name}</p>
          <p>{photo.album}</p>
          <Photo {...photo} />
        </Grid>
      ))}
    </Grid.Container>
  )
}

export default PhotosPage
