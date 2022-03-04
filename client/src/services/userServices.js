import request from '@/helpers/request'

export const loginUser = (user) => {
<<<<<<< HEAD
  return request('POST', '/login', user).then(({ data, headers }) => {
    localStorage.setItem('faunaToken', headers['X-Access-Token'])
=======
  return request('POST', '/login', user).then(({ data }) => {
    localStorage.setItem('faunaToken', headers['x-access-token'])
>>>>>>> f55582f69d0f6d4b03acc238ca7613dfc65a732f
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
