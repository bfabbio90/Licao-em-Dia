import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../contexts/auth'

// Envolve as rotas que exigem login. Sem login, manda para /login
// e guarda a página que a pessoa tentou abrir, para voltar depois.
export default function RotaProtegida() {
  const { usuario } = useAuth()
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />
  }

  return <Outlet />
}
