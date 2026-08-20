import { HashRouter, Routes, Route } from 'react-router-dom'
import { Nav } from './components/Nav/Nav'
import { Landing } from './pages/Landing'
import { InheritedAuthority } from './pages/InheritedAuthority/InheritedAuthority'
import { BeatTheCalendar } from './pages/BeatTheCalendar/BeatTheCalendar'

function App() {
  return (
    <HashRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/inherited-authority" element={<InheritedAuthority />} />
        <Route path="/beat-the-calendar" element={<BeatTheCalendar />} />
      </Routes>
    </HashRouter>
  )
}

export default App
