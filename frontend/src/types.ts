// Os mesmos campos que a API devolve em JSON
export type StatusLicao = 'Pendente' | 'Feita' | 'Entregue'

export interface Materia {
  id: number
  nome: string
  icone: string
  criadaEm: string
}

export interface Licao {
  id: number
  titulo: string
  descricao: string | null
  dataEntrega: string
  status: StatusLicao
  concluidaEm: string | null
  criadaEm: string
  atualizadaEm: string | null
  materiaId: number
}

// O que o front envia para criar ou editar uma lição
export interface LicaoInput {
  titulo: string
  descricao: string | null
  dataEntrega: string
  materiaId: number
  status: StatusLicao
}

// O que o front envia para criar uma matéria
export interface MateriaInput {
  nome: string
  icone: string
}
