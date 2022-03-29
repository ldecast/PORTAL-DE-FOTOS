import { useState } from 'react'
import { Grid } from '@nextui-org/react'
import { useAtom } from 'jotai'

import Photo from '@/components/Photo'
import { userAtom } from '@/state'
import Select from '@/components/Select'
import { languages, languageCodes } from '@/constants/LANG'
import { translateText } from '@/services/variousServices'

function PhotoPage({ url }) {
  const [User] = useAtom(userAtom)
  const photo = User.photos.find((photo) => photo.url === decodeURIComponent(url)) || {}

  const [description, setDescription] = useState(photo.description)

  const handleChangeLanguage = (e) => {
    const language = languageCodes[e.target.value]

    if (!language) return setDescription(photo.description)

    const data = {
      language,
      text: photo.description
    }

    translateText(data).then((res) => {
      setDescription(res.text)
    })
  }

  return (
    <Grid.Container gap={3} alignContent='center' style={{ height: '100%' }}>
      <Grid xs={5} md={12}>
        <Grid.Container gap={2}>
          <Grid xs={12}>
            <Photo {...photo} />
          </Grid>
          <Grid xs={12}>
            <h3>{photo.name}</h3>
          </Grid>
          <Grid xs={12}>
            <Select name='language' options={languages} onChange={handleChangeLanguage} />
          </Grid>
        </Grid.Container>
      </Grid>
      <Grid xs={7} md={12} style={{ marginTop: 20 }}>
        <p>{description}</p>
      </Grid>
      <Grid xs={12} style={{ marginTop: 20 }}>
        <p>{photo.tags?.join(', ')}</p>
      </Grid>
    </Grid.Container>
  )
}

export default PhotoPage
