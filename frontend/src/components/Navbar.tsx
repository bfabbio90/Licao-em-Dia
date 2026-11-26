import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../contexts/auth'
import { IconeSair } from './Icones'

export default function Navbar() {
  const { usuario, ehAdmin, sair } = useAuth()
  const navigate = useNavigate()

  function handleSair() {
    sair()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-conteudo">
        <Link to="/" className="marca">
          <span className="marca-simbolo" aria-hidden="true">
            L
          </span>
          Lição Em Dia
        </Link>

        {usuario ? (
          <>
            <nav className="navbar-links">
              <NavLink to="/" end>
                Calendário
              </NavLink>
              <NavLink to="/licoes">Lições</NavLink>
              <NavLink to="/materias">Matérias</NavLink>
            </nav>

            <div className="navbar-usuario">
              <span className="usuario-nome">{usuario.nome}</span>
              {ehAdmin && <span className="selo">Admin</span>}
              <button className="botao-fantasma botao-pequeno" onClick={handleSair}>
                <IconeSair tamanho={15} />
                Sair
              </button>
            </div>
          </>
        ) : (
          <nav className="navbar-links navbar-links-direita">
            <NavLink to="/login">Entrar</NavLink>
            <NavLink to="/registrar">Criar conta</NavLink>
          </nav>
        )}
      </div>
    </header>
  )
}
