import request from '@/helpers/request'

export const loginUser = (user) => {
  return request('POST', '/login', user).then(({ data }) => {
    localStorage.setItem('faunaToken', headers['x-access-token'])
    return data
  })
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
