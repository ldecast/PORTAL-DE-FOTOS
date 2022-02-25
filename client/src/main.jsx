import '@/styles/index.css'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { NextUIProvider } from '@nextui-org/react';

import { darkTheme } from '@/theme';
import App from '@/components/App'

ReactDOM.render(
  <StrictMode>
    <NextUIProvider theme={darkTheme}>
      <App />
    </NextUIProvider>
  </StrictMode>,
  document.querySelector('main')
)
