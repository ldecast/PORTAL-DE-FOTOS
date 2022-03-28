import request from '@/helpers/request'

export const extractText = (photo) => {
  return request('POST', '/text', photo)
}

export const translateText = (data) => {
  return request('POST', '/translate', data)
}

export const chatbotService = (message) => {
  return request('POST', '/chat', message)
}
