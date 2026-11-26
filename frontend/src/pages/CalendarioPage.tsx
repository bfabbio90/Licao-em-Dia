import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { concluirLicao, listarLicoes, listarMaterias, mensagemDeErro } from '../api/api'
import { useAuth } from '../contexts/auth'
import type { Licao, Materia } from '../types'
import { corDaMateria } from '../utils/cores'
import {
  deISO,
  diaPorExtenso,
  diasDaGrade,
  estaAtrasada,
  hojeISO,
  nomeDoMes,
  somarDias,
} from '../utils/datas'

const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Quantas lições cabem dentro de um dia da grade antes do "+N"
const MAXIMO_NO_DIA = 3

// "2026-11-27T00:00:00" → "2026-11-27"
function diaDaLicao(licao: Licao): string {
  return licao.dataEntrega.slice(0, 10)
}

// Passa a cor da matéria para o CSS como a variável --cor
function estiloDaCor(materiaId: number): CSSProperties {
  return { '--cor': corDaMateria(materiaId) } as CSSProperties
}

export default function CalendarioPage() {
  const { usuario } = useAuth()
  const hoje = hojeISO()

  const [licoes, setLicoes] = useState<Licao[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Mês que aparece na grade (mes vai de 0 a 11) e o dia clicado
  const [mesVisivel, setMesVisivel] = useState(() => {
    const agora = new Date()
    return { ano: agora.getFullYear(), mes: agora.getMonth() }
  })
  const [diaSelecionado, setDiaSelecionado] = useState(hoje)

  useEffect(() => {
    async function carregar() {
      try {
        const [listaLicoes, listaMaterias] = await Promise.all([listarLicoes(), listarMaterias()])
        setLicoes(listaLicoes)
        setMaterias(listaMaterias)
      } catch (e) {
        setErro(mensagemDeErro(e))
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  // Lições agrupadas por dia: { "2026-11-27": [lição, lição], ... }
  // Em cada dia, as pendentes aparecem primeiro.
  const licoesPorDia = useMemo(() => {
    const mapa = new Map<string, Licao[]>()
    for (const licao of licoes) {
      const dia = diaDaLicao(licao)
      mapa.set(dia, [...(mapa.get(dia) ?? []), licao])
    }
    for (const lista of mapa.values()) {
      lista.sort((a, b) => Number(a.status !== 'Pendente') - Number(b.status !== 'Pendente'))
    }
    return mapa
  }, [licoes])

  // Números do resumo no topo
  const daquiUmaSemana = somarDias(hoje, 7)
  const prefixoDoMes = `${mesVisivel.ano}-${String(mesVisivel.mes + 1).padStart(2, '0')}`
  const pendentes = licoes.filter((l) => l.status === 'Pendente')
  const resumo = {
    hoje: pendentes.filter((l) => diaDaLicao(l) === hoje).length,
    semana: pendentes.filter((l) => diaDaLicao(l) > hoje && diaDaLicao(l) <= daquiUmaSemana).length,
    atrasadas: licoes.filter(estaAtrasada).length,
    feitasNoMes: licoes.filter(
      (l) => l.status !== 'Pendente' && diaDaLicao(l).startsWith(prefixoDoMes),
    ).length,
  }

  function mudarMes(quantos: number) {
    setMesVisivel(({ ano, mes }) => {
      const data = new Date(ano, mes + quantos, 1)
      return { ano: data.getFullYear(), mes: data.getMonth() }
    })
  }

  function irParaHoje() {
    const agora = new Date()
    setMesVisivel({ ano: agora.getFullYear(), mes: agora.getMonth() })
    setDiaSelecionado(hoje)
  }

  function selecionarDia(dia: string) {
    setDiaSelecionado(dia)
    // Clicou num dia do mês anterior ou do próximo: a grade acompanha
    const data = deISO(dia)
    if (data.getMonth() !== mesVisivel.mes) {
      setMesVisivel({ ano: data.getFullYear(), mes: data.getMonth() })
    }
  }

  async function handleConcluir(id: number) {
    setErro('')
    try {
      const atualizada = await concluirLicao(id)
      setLicoes((atuais) => atuais.map((l) => (l.id === id ? atualizada : l)))
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  function nomeDaMateria(materiaId: number): string {
    const materia = materias.find((m) => m.id === materiaId)
    return materia ? `${materia.icone} ${materia.nome}`.trim() : 'Sem matéria'
  }

  if (carregando) {
    return <p>Carregando...</p>
  }

  const primeiroNome = usuario?.nome.split(' ')[0] ?? ''
  const licoesDoDia = licoesPorDia.get(diaSelecionado) ?? []

  let mensagem = 'Tudo em dia por aqui. 🎉'
  if (resumo.atrasadas > 0) {
    mensagem = `${resumo.atrasadas === 1 ? 'Há 1 lição atrasada' : `Há ${resumo.atrasadas} lições atrasadas`}. Que tal começar por ${resumo.atrasadas === 1 ? 'ela' : 'elas'}?`
  } else if (resumo.hoje > 0) {
    mensagem = resumo.hoje === 1 ? '1 lição para entregar hoje.' : `${resumo.hoje} lições para entregar hoje.`
  }

  let rotuloDoDia = ''
  if (diaSelecionado === hoje) rotuloDoDia = 'Hoje'
  else if (diaSelecionado === somarDias(hoje, 1)) rotuloDoDia = 'Amanhã'
  else if (diaSelecionado === somarDias(hoje, -1)) rotuloDoDia = 'Ontem'

  return (
    <section className="pagina-calendario">
      <div className="cabecalho">
        <div className="saudacao">
          <h1>Olá, {primeiroNome}!</h1>
          <p>{mensagem}</p>
        </div>
        <Link to={`/licoes/nova?data=${diaSelecionado}`} state={{ de: '/' }} className="botao">
          + Nova lição
        </Link>
      </div>

      {erro && <p className="erro">{erro}</p>}

      <div className="resumo">
        <div className="resumo-item">
          <strong>{resumo.hoje}</strong>
          <span>para hoje</span>
        </div>
        <div className="resumo-item">
          <strong>{resumo.semana}</strong>
          <span>nos próximos 7 dias</span>
        </div>
        <div className={resumo.atrasadas > 0 ? 'resumo-item alerta' : 'resumo-item'}>
          <strong>{resumo.atrasadas}</strong>
          <span>atrasadas</span>
        </div>
        <div className="resumo-item sucesso">
          <strong>{resumo.feitasNoMes}</strong>
          <span>feitas no mês</span>
        </div>
      </div>

      <div className="calendario-layout">
        <div className="calendario">
          <div className="calendario-topo">
            <h2>{nomeDoMes(mesVisivel.ano, mesVisivel.mes)}</h2>
            <div className="navegacao-mes">
              <button className="botao-icone" onClick={() => mudarMes(-1)} aria-label="Mês anterior">
                ‹
              </button>
              <button className="botao-secundario" onClick={irParaHoje}>
                Hoje
              </button>
              <button className="botao-icone" onClick={() => mudarMes(1)} aria-label="Próximo mês">
                ›
              </button>
            </div>
          </div>

          <div className="semana">
            {DIAS_DA_SEMANA.map((nome) => (
              <span key={nome}>{nome}</span>
            ))}
          </div>

          <div className="grade">
            {diasDaGrade(mesVisivel.ano, mesVisivel.mes).map((dia) => {
              const doDia = licoesPorDia.get(dia) ?? []
              const classes = ['dia']
              if (deISO(dia).getMonth() !== mesVisivel.mes) classes.push('fora-do-mes')
              if (dia === hoje) classes.push('hoje')
              if (dia === diaSelecionado) classes.push('selecionado')

              return (
                <button
                  key={dia}
                  className={classes.join(' ')}
                  onClick={() => selecionarDia(dia)}
                  aria-pressed={dia === diaSelecionado}
                  aria-label={`${diaPorExtenso(dia)}: ${doDia.length === 1 ? '1 lição' : `${doDia.length} lições`}`}
                >
                  <span className="dia-numero">{deISO(dia).getDate()}</span>
                  <span className="dia-licoes">
                    {doDia.slice(0, MAXIMO_NO_DIA).map((licao) => {
                      const classesChip = ['chip']
                      if (licao.status !== 'Pendente') classesChip.push('concluida')
                      if (estaAtrasada(licao)) classesChip.push('atrasada')
                      return (
                        <span
                          key={licao.id}
                          className={classesChip.join(' ')}
                          style={estiloDaCor(licao.materiaId)}
                        >
                          {licao.titulo}
                        </span>
                      )
                    })}
                    {doDia.length > MAXIMO_NO_DIA && (
                      <span className="chip-mais">+{doDia.length - MAXIMO_NO_DIA}</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {materias.length > 0 && (
            <ul className="legenda">
              {materias.map((m) => (
                <li key={m.id} style={estiloDaCor(m.id)}>
                  <span className="legenda-cor" />
                  {`${m.icone} ${m.nome}`.trim()}
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="painel-dia">
          {rotuloDoDia && <p className="painel-rotulo">{rotuloDoDia}</p>}
          <h2>{diaPorExtenso(diaSelecionado)}</h2>

          {licoesDoDia.length === 0 ? (
            <p className="painel-vazio">Nenhuma lição para este dia.</p>
          ) : (
            <ul className="painel-lista">
              {licoesDoDia.map((licao) => {
                const atrasada = estaAtrasada(licao)
                return (
                  <li key={licao.id} style={estiloDaCor(licao.materiaId)}>
                    <div className="card-topo">
                      <span className="materia">{nomeDaMateria(licao.materiaId)}</span>
                      <span className={`status status-${licao.status.toLowerCase()}`}>
                        {licao.status}
                      </span>
                    </div>
                    <strong className="painel-titulo">{licao.titulo}</strong>
                    {licao.descricao && <p className="descricao">{licao.descricao}</p>}
                    {atrasada && <p className="data atrasada">Atrasada</p>}
                    <div className="acoes">
                      {licao.status === 'Pendente' && (
                        <button onClick={() => handleConcluir(licao.id)}>Marcar como feita</button>
                      )}
                      <Link
                        to={`/licoes/${licao.id}/editar`}
                        state={{ de: '/' }}
                        className="botao botao-secundario"
                      >
                        Editar
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <Link
            to={`/licoes/nova?data=${diaSelecionado}`}
            state={{ de: '/' }}
            className="botao botao-adicionar"
          >
            + Adicionar lição neste dia
          </Link>
        </aside>
      </div>
    </section>
  )
}
