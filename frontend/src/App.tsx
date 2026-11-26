import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Navbar from './components/Navbar'
import RotaProtegida from './components/RotaProtegida'
import AuthProvider from './contexts/AuthProvider'
import LicaoFormPage from './pages/LicaoFormPage'
import LicoesPage from './pages/LicoesPage'
import LoginPage from './pages/LoginPage'
import MateriasPage from './pages/MateriasPage'
import RegistroPage from './pages/RegistroPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="conteudo">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registrar" element={<RegistroPage />} />

            {/* Rotas que exigem login */}
            <Route element={<RotaProtegida />}>
              <Route path="/" element={<LicoesPage />} />
              <Route path="/licoes/nova" element={<LicaoFormPage />} />
              <Route path="/licoes/:id/editar" element={<LicaoFormPage />} />
              <Route path="/materias" element={<MateriasPage />} />
            </Route>

            {/* Qualquer outro endereço volta para o início */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}
