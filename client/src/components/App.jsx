import css from '@/styles/App.module.css'

import { Container } from '@nextui-org/react'
import { Slide, ToastContainer } from 'react-toastify'
import { Redirect, Route, Switch } from 'wouter'

import Navbar from '@/components/Navbar'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'

import background from '@assets/background.svg'

function App() {
  const isUserLoggedIn = false

  const routes = [
    {
      path: '/login',
      component: <LoginPage />,
      condition: !isUserLoggedIn,
      alternativeComponent: <Redirect to='/' />
    },
    {
      path: '/signup',
      component: <SignupPage />,
      condition: !isUserLoggedIn,
      alternativeComponent: <Redirect to='/' />
    },
    {
      path: '/',
      component: <HomePage />,
      condition: isUserLoggedIn,
      alternativeComponent: <Redirect to='/login' />
    },
    {
      path: '',
      component: <Redirect to='/' />,
      condition: isUserLoggedIn,
      alternativeComponent: <Redirect to='/login' />
    }
  ]

  return (
    <main
      className={css.base}
      style={{ backgroundImage: `url(${background})` }}
    >
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
          {routes.map(({ path, component, condition = true, alternativeComponent = <></> }) => (
            <Route key={path} path={path}>
              {condition ? component : alternativeComponent}
            </Route>
          ))}
        </Switch>
      </Container>
    </main>
  )
}

export default App
