import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

const parameters = new URLSearchParams(window.location.search)
const initialLanguage = parameters.get('lang') === 'en' ? 'en-HK' : 'zh-Hant-HK'

createRoot(document.getElementById('root')).render(
  <StrictMode><App initialLanguage={initialLanguage} /></StrictMode>,
)
