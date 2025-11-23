import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AppProvider } from './AppContext' // <--- IMPORT THIS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>  {/* <--- THIS WRAPPER IS REQUIRED */}
      <App />
    </AppProvider>
  </React.StrictMode>,
)