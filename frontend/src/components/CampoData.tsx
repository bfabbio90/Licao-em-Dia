import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { deDataBR, deISO, diasDaGrade, formatarData, hojeISO, nomeDoMes, somarDias } from '../utils/datas'

interface CampoDataProps {
  valor: string // "2026-11-27", ou '' enquanto a data não estiver completa
  onChange: (valor: string) => void
  required?: boolean
}

const INICIAIS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

// Coloca as barras sozinho: "27112026" → "27/11/2026"
function aplicarMascara(texto: string): string {
  const numeros = texto.replace(/\D/g, '').slice(0, 8)
  if (numeros.length <= 2) return numeros
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`
}

// Mês (0 a 11) e ano de uma data "2026-11-27"; sem data, usa o mês atual
function mesDe(iso: string) {
  const data = iso ? deISO(iso) : new Date()
  return { ano: data.getFullYear(), mes: data.getMonth() }
}

// Campo de data em dd/mm/aaaa, com um calendário que abre ao clicar.
// O <input type="date"> segue o idioma do navegador (em inglês vira mm/dd/yyyy),
// por isso o calendário é desenhado aqui, sempre em português.
export default function CampoData({ valor, onChange, required }: CampoDataProps) {
  const [texto, setTexto] = useState(valor ? formatarData(valor) : '')
  const [aberto, setAberto] = useState(false)
  const [mesVisivel, setMesVisivel] = useState(() => mesDe(valor))

  const caixaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hoje = hojeISO()

  // Quando o valor muda por fora (ex.: o formulário de edição carregou a lição),
  // atualiza o texto. Não mexe enquanto a pessoa ainda está digitando.
  const [valorAnterior, setValorAnterior] = useState(valor)
  if (valor !== valorAnterior) {
    setValorAnterior(valor)
    if (valor !== deDataBR(texto)) {
      setTexto(valor ? formatarData(valor) : '')
    }
  }

  // Calendário aberto: fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!aberto) return

    function aoClicar(evento: MouseEvent) {
      if (!caixaRef.current?.contains(evento.target as Node)) setAberto(false)
    }
    function aoApertarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAberto(false)
    }

    document.addEventListener('mousedown', aoClicar)
    document.addEventListener('keydown', aoApertarTecla)
    return () => {
      document.removeEventListener('mousedown', aoClicar)
      document.removeEventListener('keydown', aoApertarTecla)
    }
  }, [aberto])

  function abrir() {
    if (aberto) return
    setMesVisivel(mesDe(valor)) // abre no mês da data escolhida
    setAberto(true)
  }

  function handleDigitar(evento: ChangeEvent<HTMLInputElement>) {
    const novoTexto = aplicarMascara(evento.target.value)
    const iso = deDataBR(novoTexto)

    // Mensagem que o navegador mostra ao tentar salvar com a data errada
    if (novoTexto.length === 10 && !iso) {
      evento.target.setCustomValidity('Essa data não existe.')
    } else if (novoTexto.length > 0 && novoTexto.length < 10) {
      evento.target.setCustomValidity('Digite a data completa: dd/mm/aaaa.')
    } else {
      evento.target.setCustomValidity('')
    }

    setTexto(novoTexto)
    onChange(iso)
    if (iso) setMesVisivel(mesDe(iso)) // o calendário acompanha o que foi digitado
  }

  function escolher(iso: string) {
    inputRef.current?.setCustomValidity('')
    setTexto(formatarData(iso))
    onChange(iso)
    setAberto(false)
    inputRef.current?.focus()
  }

  function mudarMes(quantos: number) {
    setMesVisivel(({ ano, mes }) => {
      const data = new Date(ano, mes + quantos, 1)
      return { ano: data.getFullYear(), mes: data.getMonth() }
    })
  }

  return (
    <div className="campo-data" ref={caixaRef}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        autoComplete="off"
        maxLength={10}
        value={texto}
        onChange={handleDigitar}
        onFocus={abrir}
        onClick={abrir}
        required={required}
      />
      <button
        type="button"
        className="campo-data-botao"
        onClick={() => (aberto ? setAberto(false) : abrir())}
        aria-label="Abrir calendário"
        aria-expanded={aberto}
      >
        📅
      </button>

      {aberto && (
        <div className="seletor-data" role="dialog" aria-label="Escolher data">
          <div className="seletor-topo">
            <button type="button" className="botao-icone" onClick={() => mudarMes(-1)} aria-label="Mês anterior">
              ‹
            </button>
            <strong>{nomeDoMes(mesVisivel.ano, mesVisivel.mes)}</strong>
            <button type="button" className="botao-icone" onClick={() => mudarMes(1)} aria-label="Próximo mês">
              ›
            </button>
          </div>

          <div className="seletor-semana">
            {INICIAIS_DA_SEMANA.map((inicial, i) => (
              <span key={i}>{inicial}</span>
            ))}
          </div>

          <div className="seletor-grade">
            {diasDaGrade(mesVisivel.ano, mesVisivel.mes).map((dia) => {
              const classes = ['seletor-dia']
              if (deISO(dia).getMonth() !== mesVisivel.mes) classes.push('fora-do-mes')
              if (dia === hoje) classes.push('hoje')
              if (dia === valor) classes.push('selecionado')
              return (
                <button
                  key={dia}
                  type="button"
                  className={classes.join(' ')}
                  onClick={() => escolher(dia)}
                  aria-label={formatarData(dia)}
                  aria-pressed={dia === valor}
                >
                  {deISO(dia).getDate()}
                </button>
              )
            })}
          </div>

          <div className="seletor-atalhos">
            <button type="button" className="botao-secundario" onClick={() => escolher(hoje)}>
              Hoje
            </button>
            <button type="button" className="botao-secundario" onClick={() => escolher(somarDias(hoje, 1))}>
              Amanhã
            </button>
            <button type="button" className="botao-secundario" onClick={() => escolher(somarDias(hoje, 7))}>
              Daqui a 1 semana
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
