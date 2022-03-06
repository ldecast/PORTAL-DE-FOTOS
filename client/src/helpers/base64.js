export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })

export const filterBase64 = (base64) => {
  const base64Data = base64.slice(base64.indexOf(',') + 1)
  return base64Data
}

export const composeBase64 = (base64) => {
  if (!base64) return null
  const base64Data = `data:image/jpeg;base64,${base64}`
  return base64Data
}
