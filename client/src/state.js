import { atom } from 'jotai'

export const emptyUser = {
  user: undefined,
  name: undefined,
  photo: undefined,
  photos: []
}

export const userAtom = atom({
  ...emptyUser,
  isLoggedIn: !!localStorage.getItem('faunaToken')
})

export const albumsAtom = atom([])
