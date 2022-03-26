import { useRef, useState } from 'react'

import { toBase64 } from '@/helpers/base64'

function usePhoto(initialPhoto) {
  const [selectedPhoto, setSelectedPhoto] = useState(initialPhoto || '')
  const [takingPhoto, setTakingPhoto] = useState(false)

  const webcamRef = useRef(null)

  const handleStartTakingPhoto = (e) => {
    e && e.preventDefault()
    setSelectedPhoto('pending')
    setTakingPhoto(true)
  }

  const handleTakePhoto = async (e) =>
    new Promise((resolve) => {
      e && e.preventDefault()

      const imageSrc = webcamRef.current.getScreenshot()
      setSelectedPhoto(imageSrc)
      setTakingPhoto(false)
      resolve(imageSrc)
    })

  const handleSelectPhoto = (e) => {
    e && e.preventDefault()
    setTakingPhoto(false)

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
    takingPhoto,
    handleStartTakingPhoto,
    handleTakePhoto,
    handleSelectPhoto,
    webcamRef
  }
}

export default usePhoto
