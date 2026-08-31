import { HashRouter, Routes, Route } from 'react-router-dom'
import styles from './App.module.css'
import { Nav } from './components/Nav/Nav'
import { StartOverLink } from './components/ui/ui'
import { useLocalState } from './lib/localState'
import { Approve } from './pages/Approve/Approve'
import { STORAGE_KEY, initialApproveState } from './pages/Approve/state'

function App() {
  const [state, setState, clear] = useLocalState(STORAGE_KEY, initialApproveState)

  return (
    <HashRouter>
      <div className={styles.header}>
        <Nav />
      </div>
      {state.screen > 1 && (
        <div className={styles.startOverBar}>
          <StartOverLink onClick={clear} />
        </div>
      )}
      <Routes>
        <Route path="/" element={<Approve state={state} setState={setState} />} />
      </Routes>
    </HashRouter>
  )
}

export default App
