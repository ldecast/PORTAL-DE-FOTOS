import { atom } from 'jotai'

export const emptyUser = {
  user: 'cargando...',
  name: 'cargando...',
  photo: undefined,
  photos: []
}

const token = localStorage.getItem('faunaToken')

export const userAtom = atom({
  ...emptyUser,
  isLoggedIn: !!token && token !== 'null' && token !== 'undefined'
})

export const albumsAtom = atom([])
