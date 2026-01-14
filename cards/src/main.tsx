import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Request } from './pages/Request/Request.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/cards">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/request" element={<Request />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
