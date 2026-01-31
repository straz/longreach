import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Lazy load pages for code splitting
const Request = lazy(() => import('./pages/Request/Request.tsx').then(m => ({ default: m.Request })))
const Report = lazy(() => import('./pages/Report/Report.tsx').then(m => ({ default: m.Report })))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/cards">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/:campaign" element={<App />} />
          <Route path="/request" element={<Request />} />
          <Route path="/report/:lid" element={<Report />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
