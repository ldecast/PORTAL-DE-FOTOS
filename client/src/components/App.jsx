import background from '@assets/background.svg'
import { Container } from '@nextui-org/react'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Slide, toast, ToastContainer } from 'react-toastify'
import { Redirect, Route, Switch } from 'wouter'

import Navbar from '@/components/Navbar'
import AlbumsPage from '@/pages/AlbumsPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import PhotosPage from '@/pages/PhotosPage'
import SignupPage from '@/pages/SignupPage'
import UpdateUserPage from '@/pages/UpdateUserPage'
import UploadPhotoPage from '@/pages/UploadPhotoPage'
import { getUser } from '@/services/userServices'
import { userAtom } from '@/state'
import css from '@/styles/App.module.css'

function App() {
  const [user, setUser] = useAtom(userAtom)
  const { isLoggedIn } = user

  useEffect(() => {
    if (!isLoggedIn) return

    getUser()
      .then((user) => {
        setUser(user)
      })
      .catch((err) => {
        toast.error('Error al obtener el usuario')
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
      path: '/albums',
      component: <AlbumsPage />,
      condition: isLoggedIn
    },
    {
      path: '/photos',
      component: <PhotosPage />,
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
        autoClose={4000}
        limit={1}
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
