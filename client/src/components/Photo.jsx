import { useState } from 'react'

import css from '@/styles/Photo.module.css'

function Photo({ url, name }) {
  const image = `http://s3.amazonaws.com/practica1.g10.imagenes/${url}`
  const [previewing, setPreviewing] = useState(false)

  const toggleViewing = () => setPreviewing(!previewing)

  return (
    <>
      <div className={css.base}>
        <img onClick={toggleViewing} src={image} alt={name} />
      </div>
      {previewing && (
        <div className={css.preview} onClick={toggleViewing}>
          <h3>{name}</h3>
          <img src={image} alt={name} />
        </div>
      )}
    </>
  )
}

export default Photo
