import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position='top-right'
        reverseOrder={false}
        gutter={8}
        containerStyle={{ zIndex: 9999 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1B3A6B',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
          },
          success: {
            style: {
              background: '#166534',
              color: '#ffffff'
            },
            iconTheme: {
              primary: '#4ade80',
              secondary: '#ffffff'
            }
          },
          error: {
            style: {
              background: '#991b1b',
              color: '#ffffff'
            },
            iconTheme: {
              primary: '#f87171',
              secondary: '#ffffff'
            }
          },
          loading: {
            style: {
              background: '#1e40af',
              color: '#ffffff'
            }
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
