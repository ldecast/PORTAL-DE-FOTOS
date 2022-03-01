import '@/styles/index.css'
import 'react-toastify/dist/ReactToastify.css'

import { StrictMode, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { NextUIProvider } from '@nextui-org/react'
import { Provider } from 'jotai'

import { darkTheme } from '@/theme'
import App from '@/components/App'

ReactDOM.render(
  <StrictMode>
    <NextUIProvider theme={darkTheme}>
      <Provider>
        <Suspense fallback="Loading...">
          <App />
        </Suspense>
      </Provider>
    </NextUIProvider>
  </StrictMode>,
  document.querySelector('main')
)
