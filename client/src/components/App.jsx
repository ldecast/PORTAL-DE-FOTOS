import background from '@assets/background.svg'
import { Container } from '@nextui-org/react'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Slide, toast, ToastContainer } from 'react-toastify'
import { Redirect, Route, Switch } from 'wouter'

import Navbar from '@/components/Navbar'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import PhotosPage from '@/pages/PhotosPage'
import SignupPage from '@/pages/SignupPage'
import UpdateUserPage from '@/pages/UpdateUserPage'
import UploadPhotoPage from '@/pages/UploadPhotoPage'
import { getUser } from '@/services/userServices'
import { albumsAtom, emptyUser, userAtom } from '@/state'
import css from '@/styles/App.module.css'
import PhotoPage from '@/pages/PhotoPage'
import ChatPage from '@/pages/ChatPage'
import ExtractPhotoPage from '@/pages/ExtractPhotoPage'

function App() {
  const [user, setUser] = useAtom(userAtom)
  const [, setAlbums] = useAtom(albumsAtom)

  const { isLoggedIn } = user

  useEffect(() => {
    const token = localStorage.getItem('faunaToken')

    if (!token) return
    if (!isLoggedIn) return

    getUser()
      .then((user) => {
        const newUser = {
          isLoggedIn: true,
          ...user
        }
        setUser(newUser)

        const albums = []

        user.photos
          .filter((photo) => photo.url !== user.photo.url)
          .forEach((photo) => {
            photo.tags.forEach((tag) => {
              const album = albums.find((album) => album.name === tag)
              if (!album)
                albums.push({
                  name: tag,
                  photos: []
                })

              albums.find((album) => album.name === tag).photos.push(photo)
            })
          })

        setAlbums(albums)
      })
      .catch(() => {
        const newUser = {
          isLoggedIn: false,
          ...emptyUser
        }
        setUser(newUser)

        toast.error('Se ha cerrado tu sesión')
      })
  }, [isLoggedIn])

  const routes = [
    {
      path: '/login',
      component: <LoginPage />,
      condition: !isLoggedIn
    },
    {
      path: '/signup',
      component: <SignupPage />,
      condition: !isLoggedIn
    },
    {
      path: '/home',
      component: <HomePage />,
      condition: isLoggedIn
    },
    {
      path: '/profile',
      component: <UpdateUserPage />,
      condition: isLoggedIn
    },
    {
      path: '/upload',
      component: <UploadPhotoPage />,
      condition: isLoggedIn
    },
    {
      path: '/photos',
      component: <PhotosPage />,
      condition: isLoggedIn
    },
    {
      path: '/photos/:url',
      component: (params) => <PhotoPage url={params.url} />,
      condition: isLoggedIn
    },
    {
      path: '/extract',
      component: <ExtractPhotoPage />,
      condition: isLoggedIn
    },
    {
      path: '/chat',
      component: <ChatPage />,
      condition: isLoggedIn
    },
    {
      component: <Redirect to='/login' />,
      condition: !isLoggedIn
    },
    {
      component: <Redirect to='/home' />,
      condition: isLoggedIn
    }
  ]

  return (
    <main className={css.base} style={{ backgroundImage: `url(${background})` }}>
      <ToastContainer
        autoClose={2500}
        limit={2}
        toastClassName={css.toast}
        theme='dark'
        transition={Slide}
      />
      <Navbar />
      <Container className={css.content}>
        <Switch>
          {routes.map(
            ({ path = '', component, condition }) =>
              condition && (
                <Route key={path} path={path}>
                  {component}
                </Route>
              )
          )}
        </Switch>
      </Container>
    </main>
  )
}

export default App
