import { BrowserRouter, Route, Routes } from 'react-router'
import Navbar from './components/Navbar'
import LicaoFormPage from './pages/LicaoFormPage'
import LicoesPage from './pages/LicoesPage'
import MateriasPage from './pages/MateriasPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<LicoesPage />} />
          <Route path="/licoes/nova" element={<LicaoFormPage />} />
          <Route path="/licoes/:id/editar" element={<LicaoFormPage />} />
          <Route path="/materias" element={<MateriasPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
