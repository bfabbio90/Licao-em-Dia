import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { mensagemDeErro, registrar } from '../api/api'
import Apresentacao from '../components/Apresentacao'
import { useAuth } from '../contexts/auth'

export default function RegistroPage() {
  const { usuario, entrar } = useAuth()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro('')

    // A API também confere, mas assim o aviso aparece sem esperar a resposta
    if (senha !== confirmarSenha) {
      setErro('As senhas não conferem.')
      return
    }

    setEnviando(true)
    try {
      await registrar({ nome, email, senha, confirmarSenha })
      // Conta criada: já faz o login, para a pessoa não digitar tudo de novo
      await entrar({ email, senha })
      navigate('/', { replace: true })
    } catch (e) {
      // Ex.: "Este e-mail já está cadastrado." ou as regras de senha do Identity
      setErro(mensagemDeErro(e))
      setEnviando(false)
    }
  }

  return (
    <section className="pagina-auth">
      <Apresentacao />

      <form className="formulario" onSubmit={handleSubmit}>
        <h1>Criar conta</h1>

        {erro && <p className="erro">{erro}</p>}

        <label>
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={100}
            autoComplete="name"
            required
            autoFocus
          />
        </label>

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={6}
            autoComplete="new-password"
            required
          />
          <small className="dica">Pelo menos 6 caracteres, com um número e uma letra minúscula.</small>
        </label>

        <label>
          Confirmar senha
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="rodape-auth">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </section>
  )
}
