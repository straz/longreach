import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Request } from './pages/Request/Request.tsx'
import { Report } from './pages/Report/Report.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/cards">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/request" element={<Request />} />
        <Route path="/report/:lid" element={<Report />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
