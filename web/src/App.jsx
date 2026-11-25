import { NavLink, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import './App.css'

axios.defaults.baseURL = '/api'

const PAGES = [
  ['/', 'Accueil'],
  ['/retrospectif', 'Rétrospectif'],
  ['/prospectif', 'Prospectif'],
  ['/carte', 'Carte'],
  ['/participatif', 'Participatif'],
  ['/resultats', 'Résultats'],
  ['/methodologie', 'Méthodologie'],
]

function Page({ title }) {
  return (
    <main>
      <h1>{title}</h1>
      <p>État M0: aucun contenu métier n'est simulé sur cette page.</p>
    </main>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <header>
        <strong>Observatoire de la mobilité de Yaoundé</strong>
        <nav aria-label="Navigation principale">
          {PAGES.map(([path, label]) => (
            <NavLink key={path} to={path}>{label}</NavLink>
          ))}
        </nav>
      </header>
      <Routes>
        {PAGES.map(([path, label]) => (
          <Route key={path} path={path} element={<Page title={label} />} />
        ))}
        <Route path="*" element={<Page title="Page non trouvée" />} />
      </Routes>
    </div>
  )
}
