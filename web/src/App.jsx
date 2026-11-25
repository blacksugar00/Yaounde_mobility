import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Accueil from './pages/Accueil';
import Retrospectif from './pages/Retrospectif';
import Prospectif from './pages/Prospectif';
import Carte from './pages/Carte';
import Participatif from './pages/Participatif';
import Resultats from './pages/Resultats';
import Methodologie from './pages/Methodologie';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Accueil />} />
          <Route path="retrospectif" element={<Retrospectif />} />
          <Route path="prospectif" element={<Prospectif />} />
          <Route path="carte" element={<Carte />} />
          <Route path="participatif" element={<Participatif />} />
          <Route path="resultats" element={<Resultats />} />
          <Route path="methodologie" element={<Methodologie />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
