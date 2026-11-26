import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { entrar as entrarNaApi } from '../api/api'
import { apagarSessao, EVENTO_SESSAO_EXPIRADA, lerSessaoValida, salvarSessao } from '../api/sessao'
import type { LoginInput, UsuarioLogado } from '../types'
import { AuthContext } from './auth'

export default function AuthProvider({ children }: { children: ReactNode }) {
  // Ao abrir o site, recupera o login guardado (se o token ainda valer)
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(lerSessaoValida)
  const [sessaoExpirou, setSessaoExpirou] = useState(false)

  // O api.ts dispara este evento quando a API responde 401
  useEffect(() => {
    function aoExpirar() {
      setUsuario(null)
      setSessaoExpirou(true)
    }
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar)
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar)
  }, [])

  async function entrar(dados: LoginInput) {
    const resposta = await entrarNaApi(dados)
    salvarSessao(resposta)
    setUsuario(resposta)
    setSessaoExpirou(false)
  }

  function sair() {
    apagarSessao()
    setUsuario(null)
    setSessaoExpirou(false)
  }

  const ehAdmin = usuario?.roles.includes('Admin') ?? false

  return (
    <AuthContext.Provider value={{ usuario, ehAdmin, sessaoExpirou, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}
