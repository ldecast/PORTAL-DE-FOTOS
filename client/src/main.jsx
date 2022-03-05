import '@/styles/index.css'
import 'react-toastify/dist/ReactToastify.css'

import { NextUIProvider } from '@nextui-org/react'
import { Provider } from 'jotai'
import { StrictMode, Suspense } from 'react'
import ReactDOM from 'react-dom'

import App from '@/components/App'
import { darkTheme } from '@/theme'

ReactDOM.render(
  <StrictMode>
    <NextUIProvider theme={darkTheme}>
      <Provider>
        <Suspense fallback='Loading...'>
          <App />
        </Suspense>
      </Provider>
    </NextUIProvider>
  </StrictMode>,
  document.querySelector('main')
)
