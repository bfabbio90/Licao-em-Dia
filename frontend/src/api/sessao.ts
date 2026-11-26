import type { UsuarioLogado } from '../types'

// Onde o usuário logado (com o token) fica guardado no navegador
const CHAVE = 'myhomework_sessao'

// Nome do evento disparado quando a API recusa o token (vencido ou inválido)
export const EVENTO_SESSAO_EXPIRADA = 'myhomework:sessao-expirada'

export function lerSessao(): UsuarioLogado | null {
  const texto = localStorage.getItem(CHAVE)
  if (!texto) return null

  try {
    return JSON.parse(texto) as UsuarioLogado
  } catch {
    // Algo estranho foi gravado ali: descarta
    localStorage.removeItem(CHAVE)
    return null
  }
}

export function salvarSessao(usuario: UsuarioLogado) {
  localStorage.setItem(CHAVE, JSON.stringify(usuario))
}

export function apagarSessao() {
  localStorage.removeItem(CHAVE)
}

// Apaga a sessão e avisa o resto do app (o AuthProvider escuta esse evento)
export function encerrarSessaoExpirada() {
  apagarSessao()
  window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA))
}

// O token JWT tem três partes separadas por pontos. A do meio é um JSON
// em base64 com o campo "exp": o momento em que ele vence, em segundos.
export function tokenVencido(token: string): boolean {
  try {
    const parteDoMeio = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(parteDoMeio)) as { exp?: number }
    return exp === undefined || exp * 1000 <= Date.now()
  } catch {
    // Se não dá para ler, trata como vencido
    return true
  }
}

// Sessão guardada que ainda vale; se o token venceu, apaga e devolve null
export function lerSessaoValida(): UsuarioLogado | null {
  const sessao = lerSessao()
  if (sessao && tokenVencido(sessao.token)) {
    apagarSessao()
    return null
  }
  return sessao
}
