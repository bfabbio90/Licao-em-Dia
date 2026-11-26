import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { mensagemDeErro } from '../api/api'
import Apresentacao from '../components/Apresentacao'
import { useAuth } from '../contexts/auth'

export default function LoginPage() {
  const { usuario, entrar, sessaoExpirou } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Página que a pessoa tentou abrir antes de cair no login
  const destino = (location.state as { de?: string } | null)?.de ?? '/'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Já está logado: não precisa ver esta tela
  if (usuario) {
    return <Navigate to={destino} replace />
  }

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await entrar({ email, senha })
      navigate(destino, { replace: true })
    } catch (e) {
      // Ex.: "E-mail ou senha inválidos."
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <section className="pagina-auth">
      <Apresentacao />
      <h1>Entrar</h1>

      {sessaoExpirou && !erro && <p className="aviso">Sua sessão expirou. Entre de novo.</p>}
      {erro && <p className="erro">{erro}</p>}

      <form className="formulario" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            autoFocus
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="rodape-auth">
        Ainda não tem conta? <Link to="/registrar">Criar conta</Link>
      </p>
    </section>
  )
}
