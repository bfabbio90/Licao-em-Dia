import type { Licao } from '../types'

// A API manda datas assim: "2026-11-27T00:00:00".
// Os 10 primeiros caracteres são a data: "2026-11-27".

// A data de hoje no formato "2026-11-26"
export function hojeISO(): string {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

// "2026-11-27T00:00:00" → "27/11/2026"
export function formatarData(dataDaApi: string): string {
  const [ano, mes, dia] = dataDaApi.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// Atrasada = ainda está pendente e a data de entrega já passou
export function estaAtrasada(licao: Licao): boolean {
  return licao.status === 'Pendente' && licao.dataEntrega.slice(0, 10) < hojeISO()
}
