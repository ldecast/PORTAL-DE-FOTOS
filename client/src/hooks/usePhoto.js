import { useRef, useState } from 'react'

import { toBase64 } from '@/helpers/base64'

function usePhoto(initialPhoto) {
  const [selectedPhoto, setSelectedPhoto] = useState(initialPhoto || '')
  const webcamRef = useRef(null)

  const handleStartTakingPhoto = (e) => {
    e.preventDefault()
    setSelectedPhoto('pending')
  }

  const handleTakePhoto = (e) => {
    e.preventDefault()

    const imageSrc = webcamRef.current.getScreenshot()
    setSelectedPhoto(imageSrc)
  }

  const handleSelectPhoto = (e) => {
    e.preventDefault()

    const photoInput = document.createElement('input')
    photoInput.type = 'file'
    photoInput.accept = 'image/jpeg'
    photoInput.click()
    photoInput.onchange = () => {
      const file = photoInput.files[0]
      toBase64(file).then((imageSrc) => {
        setSelectedPhoto(imageSrc)
      })
    }
  }

  return {
    selectedPhoto,
    handleStartTakingPhoto,
    handleTakePhoto,
    handleSelectPhoto,
    webcamRef
  }
}

export default usePhoto
