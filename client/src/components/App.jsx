import { Route, Switch } from 'wouter'

import Navbar from '@/components/Navbar'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import css from '@/styles/App.module.css'

function App() {
  const isUserLoggedIn = true

  const routes = [
    {
      path: '/',
      component: <HomePage />,
      condition: isUserLoggedIn,
      alternativeComponent: <LoginPage />
    }
  ]

  return (
    <div className={css.base}>
      <Navbar />
      <div className={css.content}>
        <Switch>
          {routes.map(({ path, component, condition = true, alternativeComponent = <>

              </> }) => (
            <Route key={path} path={path}>
              {condition ? component : alternativeComponent}
            </Route>
          ))}
        </Switch>
      </div>
    </div>
  )
}

export default App
