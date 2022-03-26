import request from '@/helpers/request'

export const translateText = (data) => {
  return request('POST', '/translate', data)
}
