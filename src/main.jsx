import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Force clear stale localStorage if schema version doesn't match
const SCHEMA_VERSION = '6';
const storedVersion = localStorage.getItem('solo-leveling-schema-version');
if (storedVersion !== SCHEMA_VERSION) {
  localStorage.removeItem('solo-leveling-system');
  localStorage.setItem('solo-leveling-schema-version', SCHEMA_VERSION);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
