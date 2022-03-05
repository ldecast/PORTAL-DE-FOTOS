import request from '@/helpers/request'

export const uploadPhoto = (photo) => {
  return request('POST', '/photo', photo)
}

export const updatePhoto = () => {
  return request('PUT', '/photo')
}

export const deletePhoto = (photo) => {
  return request('DELETE', '/photo', photo)
}
