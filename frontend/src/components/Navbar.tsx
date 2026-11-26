import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '../contexts/auth'

export default function Navbar() {
  const { usuario, ehAdmin, sair } = useAuth()
  const navigate = useNavigate()

  function handleSair() {
    sair()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <span className="logo">MyHomework</span>

      {usuario ? (
        <nav>
          <NavLink to="/" end>
            Calendário
          </NavLink>
          <NavLink to="/licoes">Lições</NavLink>
          <NavLink to="/materias">Matérias</NavLink>

          <span className="usuario">
            {usuario.nome}
            {ehAdmin && <span className="selo-admin">Admin</span>}
          </span>
          <button className="botao-secundario" onClick={handleSair}>
            Sair
          </button>
        </nav>
      ) : (
        <nav>
          <NavLink to="/login">Entrar</NavLink>
          <NavLink to="/registrar">Criar conta</NavLink>
        </nav>
      )}
    </header>
  )
}
