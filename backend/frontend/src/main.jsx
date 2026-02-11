import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react' // <--- Importamos esto
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider> {/* <--- Envolvemos la App */}
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
