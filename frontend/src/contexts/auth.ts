import { createContext, useContext } from 'react'
import type { LoginInput, UsuarioLogado } from '../types'

// O que qualquer tela consegue saber e fazer sobre o login
export interface AuthValor {
  usuario: UsuarioLogado | null
  ehAdmin: boolean
  sessaoExpirou: boolean // true quando a API recusou o token (para avisar no login)
  entrar: (dados: LoginInput) => Promise<void>
  sair: () => void
}

export const AuthContext = createContext<AuthValor | null>(null)

// Uso nas telas: const { usuario, ehAdmin, sair } = useAuth()
export function useAuth(): AuthValor {
  const valor = useContext(AuthContext)
  if (!valor) {
    throw new Error('useAuth precisa estar dentro do <AuthProvider>.')
  }
  return valor
}
