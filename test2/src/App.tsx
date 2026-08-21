import { HashRouter, Routes, Route } from 'react-router-dom'
import styles from './App.module.css'
import { Breadcrumb } from './components/Breadcrumb/Breadcrumb'
import { Nav } from './components/Nav/Nav'
import { useLocalState } from './lib/localState'
import { BOUD } from './pages/BOUD/BOUD'
import { STORAGE_KEY, initialBOUDState } from './pages/BOUD/state'

function App() {
  const [state, setState, clear] = useLocalState(STORAGE_KEY, initialBOUDState)

  return (
    <HashRouter>
      <div className={styles.header}>
        <Nav />
        <Breadcrumb state={state} setState={setState} />
      </div>
      <Routes>
        <Route path="/" element={<BOUD state={state} setState={setState} onTryAnother={clear} />} />
      </Routes>
    </HashRouter>
  )
}

export default App
