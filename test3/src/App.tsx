import { HashRouter, Routes, Route } from 'react-router-dom'
import styles from './App.module.css'
import { Breadcrumb } from './components/Breadcrumb/Breadcrumb'
import { Nav } from './components/Nav/Nav'
import { useLocalState } from './lib/localState'
import { Cohort } from './pages/Cohort/Cohort'
import { STORAGE_KEY, initialCohortState } from './pages/Cohort/state'

function App() {
  const [state, setState, clear] = useLocalState(STORAGE_KEY, initialCohortState)

  return (
    <HashRouter>
      <div className={styles.header}>
        <Nav />
        <Breadcrumb state={state} setState={setState} />
      </div>
      <Routes>
        <Route path="/" element={<Cohort state={state} setState={setState} onTryAnother={clear} />} />
      </Routes>
    </HashRouter>
  )
}

export default App
