import { NavLink } from 'react-router'

export default function Navbar() {
  return (
    <header className="navbar">
      <span className="logo">MyHomework</span>
      <nav>
        <NavLink to="/" end>
          Lições
        </NavLink>
        <NavLink to="/materias">Matérias</NavLink>
      </nav>
    </header>
  )
}
