import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { concluirLicao, listarLicoes, listarMaterias, mensagemDeErro } from '../api/api'
import {
  IconeCheck,
  IconeLapis,
  IconeMais,
  IconeSetaDireita,
  IconeSetaEsquerda,
} from '../components/Icones'
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
    return <p className="carregando">Carregando...</p>
  }

  const primeiroNome = usuario?.nome.split(' ')[0] ?? ''
  const licoesDoDia = licoesPorDia.get(diaSelecionado) ?? []

  let mensagem = 'Tudo em dia por aqui.'
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
      <div className="pagina-topo">
        <div>
          <h1>Olá, {primeiroNome}</h1>
          <p className="pagina-subtitulo">{mensagem}</p>
        </div>
        <Link to={`/licoes/nova?data=${diaSelecionado}`} state={{ de: '/' }} className="botao">
          <IconeMais />
          Nova lição
        </Link>
      </div>

      {erro && <p className="erro">{erro}</p>}

      <dl className="resumo">
        <div className="resumo-item">
          <dt>Para hoje</dt>
          <dd>{resumo.hoje}</dd>
        </div>
        <div className="resumo-item">
          <dt>Próximos 7 dias</dt>
          <dd>{resumo.semana}</dd>
        </div>
        <div className={resumo.atrasadas > 0 ? 'resumo-item alerta' : 'resumo-item'}>
          <dt>Atrasadas</dt>
          <dd>{resumo.atrasadas}</dd>
        </div>
        <div className="resumo-item">
          <dt>Feitas no mês</dt>
          <dd>{resumo.feitasNoMes}</dd>
        </div>
      </dl>

      <div className="calendario-layout">
        <div className="calendario">
          <div className="calendario-topo">
            <h2>{nomeDoMes(mesVisivel.ano, mesVisivel.mes)}</h2>
            <div className="navegacao-mes">
              <button className="botao-secundario botao-pequeno" onClick={irParaHoje}>
                Hoje
              </button>
              <button className="botao-icone" onClick={() => mudarMes(-1)} aria-label="Mês anterior">
                <IconeSetaEsquerda />
              </button>
              <button className="botao-icone" onClick={() => mudarMes(1)} aria-label="Próximo mês">
                <IconeSetaDireita />
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
                const pendente = licao.status === 'Pendente'
                return (
                  <li
                    key={licao.id}
                    className={pendente ? undefined : 'licao-concluida'}
                    style={estiloDaCor(licao.materiaId)}
                  >
                    <button
                      className="licao-check"
                      onClick={() => handleConcluir(licao.id)}
                      disabled={!pendente}
                      aria-label={
                        pendente ? `Marcar "${licao.titulo}" como feita` : `"${licao.titulo}" já foi feita`
                      }
                      title={pendente ? 'Marcar como feita' : undefined}
                    >
                      {!pendente && <IconeCheck tamanho={13} strokeWidth={3} />}
                    </button>

                    <div className="painel-licao">
                      <span className="licao-titulo">{licao.titulo}</span>
                      {licao.descricao && <span className="licao-descricao">{licao.descricao}</span>}
                      <span className="painel-licao-meta">
                        <span className="licao-materia">
                          <span className="ponto-cor" />
                          {nomeDaMateria(licao.materiaId)}
                        </span>
                        {atrasada ? (
                          <span className="etiqueta-atraso">Atrasada</span>
                        ) : (
                          <span className={`status status-${licao.status.toLowerCase()}`}>
                            {licao.status}
                          </span>
                        )}
                      </span>
                    </div>

                    <Link
                      to={`/licoes/${licao.id}/editar`}
                      state={{ de: '/' }}
                      className="botao-icone"
                      aria-label={`Editar "${licao.titulo}"`}
                      title="Editar"
                    >
                      <IconeLapis />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          <Link
            to={`/licoes/nova?data=${diaSelecionado}`}
            state={{ de: '/' }}
            className="botao botao-secundario botao-adicionar"
          >
            <IconeMais />
            Adicionar lição neste dia
          </Link>
        </aside>
      </div>
    </section>
  )
}
