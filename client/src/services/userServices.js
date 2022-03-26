import request from '@/helpers/request'

export const loginUser = (user) => {
  console.log(user)
  return request('POST', '/login', user)
}

export const getUser = () => {
  return request('GET', '/user')
}

export const createUser = (user) => {
  return request('POST', '/user', user)
}

export const updateUser = (user) => {
  return request('PUT', '/user', user)
}
