import request from '@/helpers/request'

export const getAlbums = () => {
  return request('GET', '/album')
}

export const deleteAlbum = (album) => {
  return request('DELETE', `/album/${album}`)
}
