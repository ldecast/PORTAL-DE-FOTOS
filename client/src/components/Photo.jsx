import { useState } from 'react'

import css from '@/styles/Photo.module.css'

function Photo({ photo, name }) {
  const [previewing, setPreviewing] = useState(false)

  const toggleViewing = () => setPreviewing(!previewing)

  return (
    <>
      <div className={css.base}>
        <img onClick={toggleViewing} src={photo} alt={name} />
      </div>
      {previewing && (
        <div className={css.preview} onClick={toggleViewing}>
          <h3>{name}</h3>
          <img src={photo} alt={name} />
        </div>
      )}
    </>
  )
}

export default Photo
