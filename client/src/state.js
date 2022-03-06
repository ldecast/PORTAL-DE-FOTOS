import { atom } from 'jotai'

export const emptyUser = {
  user: 'cargando...',
  name: 'cargando...',
  photo: undefined,
  photos: []
}

export const userAtom = atom({
  ...emptyUser,
  isLoggedIn: !!localStorage.getItem('faunaToken')
})

export const albumsAtom = atom([])
