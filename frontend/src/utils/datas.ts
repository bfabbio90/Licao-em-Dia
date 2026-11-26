import type { Licao } from '../types'

// A API manda datas assim: "2026-11-27T00:00:00".
// Os 10 primeiros caracteres são a data: "2026-11-27".

// Um Date (no fuso do computador) no formato "2026-11-26"
export function paraISO(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

// "2026-11-26" → Date à meia-noite local.
// (new Date("2026-11-26") usaria UTC e poderia cair no dia anterior no Brasil)
export function deISO(iso: string): Date {
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

// A data de hoje no formato "2026-11-26"
export function hojeISO(): string {
  return paraISO(new Date())
}

// "2026-11-26" + 7 → "2026-12-03"
export function somarDias(iso: string, dias: number): string {
  const data = deISO(iso)
  data.setDate(data.getDate() + dias)
  return paraISO(data)
}

// Os dias que aparecem na grade de um mês: começa no domingo da semana
// do dia 1 e termina no sábado da semana do último dia.
// mes vai de 0 (janeiro) a 11 (dezembro), como no Date do JavaScript.
export function diasDaGrade(ano: number, mes: number): string[] {
  const inicio = new Date(ano, mes, 1)
  inicio.setDate(inicio.getDate() - inicio.getDay()) // volta até o domingo

  const fim = new Date(ano, mes + 1, 0) // último dia do mês
  fim.setDate(fim.getDate() + (6 - fim.getDay())) // avança até o sábado

  const dias: string[] = []
  for (const d = inicio; d <= fim; d.setDate(d.getDate() + 1)) {
    dias.push(paraISO(d))
  }
  return dias
}

function comMaiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// (2026, 10) → "Novembro de 2026"
export function nomeDoMes(ano: number, mes: number): string {
  const texto = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(ano, mes, 1),
  )
  return comMaiuscula(texto)
}

// "2026-11-27" → "Sexta-feira, 27 de novembro"
export function diaPorExtenso(iso: string): string {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(deISO(iso))
  return comMaiuscula(texto)
}

// "2026-11-27T00:00:00" → "27/11/2026"
export function formatarData(dataDaApi: string): string {
  const [ano, mes, dia] = dataDaApi.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// "27/11/2026" → "2026-11-27". Devolve '' se o texto estiver incompleto
// ou se a data não existir (ex.: 31/02/2026).
export function deDataBR(texto: string): string {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto)
  if (!partes) return ''

  const [, dia, mes, ano] = partes
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia))
  const existe =
    data.getFullYear() === Number(ano) &&
    data.getMonth() === Number(mes) - 1 &&
    data.getDate() === Number(dia)

  return existe ? `${ano}-${mes}-${dia}` : ''
}

// Atrasada = ainda está pendente e a data de entrega já passou
export function estaAtrasada(licao: Licao): boolean {
  return licao.status === 'Pendente' && licao.dataEntrega.slice(0, 10) < hojeISO()
}
