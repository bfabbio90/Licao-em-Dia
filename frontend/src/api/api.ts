import type { Licao, LicaoInput, Materia, MateriaInput } from '../types'

// Endereço da API, lido do arquivo .env.local
const API_URL = import.meta.env.VITE_API_URL

// Função base: faz a requisição, trata os erros e devolve o JSON
async function requisicao<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  let resposta: Response

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    })
  } catch {
    // O fetch só cai aqui quando nem consegue falar com a API
    throw new Error('Não foi possível falar com a API. Ela está rodando?')
  }

  if (!resposta.ok) {
    throw new Error(await lerErro(resposta))
  }

  // 204 No Content: a resposta não tem corpo para ler
  if (resposta.status === 204) {
    return undefined as T
  }

  return resposta.json()
}

// Transforma a resposta de erro da API numa frase
async function lerErro(resposta: Response): Promise<string> {
  const texto = await resposta.text()

  try {
    const json = JSON.parse(texto)

    // Erros de validação do ASP.NET vêm assim: { "errors": { "Titulo": ["..."] } }
    if (json.errors) {
      return Object.values(json.errors).flat().join(' ')
    }

    return json.title ?? texto
  } catch {
    // Não era JSON: é uma mensagem simples, como "Matéria não encontrada."
    return texto || `Erro ${resposta.status}`
  }
}

// Pega a mensagem de qualquer erro, para mostrar na tela
export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Erro inesperado.'
}

// ---------- Lições ----------

export function listarLicoes() {
  return requisicao<Licao[]>('/api/licoes')
}

export function buscarLicao(id: number) {
  return requisicao<Licao>(`/api/licoes/${id}`)
}

export function criarLicao(dados: LicaoInput) {
  return requisicao<Licao>('/api/licoes', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function editarLicao(id: number, dados: LicaoInput) {
  return requisicao<Licao>(`/api/licoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function concluirLicao(id: number) {
  return requisicao<Licao>(`/api/licoes/${id}/concluir`, { method: 'PATCH' })
}

export function apagarLicao(id: number) {
  return requisicao<void>(`/api/licoes/${id}`, { method: 'DELETE' })
}

// ---------- Matérias ----------

export function listarMaterias() {
  return requisicao<Materia[]>('/api/materias')
}

export function criarMateria(dados: MateriaInput) {
  return requisicao<Materia>('/api/materias', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function apagarMateria(id: number) {
  return requisicao<void>(`/api/materias/${id}`, { method: 'DELETE' })
}
