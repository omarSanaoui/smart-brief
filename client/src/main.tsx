import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'

const chakraSystem = createSystem(
  defaultConfig,
  defineConfig({
    preflight: false,
  }),
)

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider store={store}>
      <ChakraProvider value={chakraSystem}>
        <StrictMode>
          <App />
        </StrictMode>
      </ChakraProvider>
    </Provider>
  </BrowserRouter>
)
