import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  apagarLicao,
  concluirLicao,
  listarLicoes,
  listarMaterias,
  mensagemDeErro,
} from '../api/api'
import { IconeMais } from '../components/Icones'
import LicaoCard from '../components/LicaoCard'
import type { Licao, Materia, StatusLicao } from '../types'

type Filtro = 'Todas' | StatusLicao

const FILTROS: Filtro[] = ['Todas', 'Pendente', 'Feita', 'Entregue']

export default function LicoesPage() {
  const [licoes, setLicoes] = useState<Licao[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [filtro, setFiltro] = useState<Filtro>('Todas')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Busca as lições e as matérias quando a página abre
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

  async function handleConcluir(id: number) {
    setErro('')
    try {
      const atualizada = await concluirLicao(id)
      // Troca só a lição que mudou e mantém as outras
      setLicoes((atuais) => atuais.map((l) => (l.id === id ? atualizada : l)))
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  async function handleApagar(id: number) {
    if (!confirm('Apagar esta lição?')) return
    setErro('')
    try {
      await apagarLicao(id)
      setLicoes((atuais) => atuais.filter((l) => l.id !== id))
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  // Aplica o filtro e ordena pela data de entrega (a mais próxima primeiro)
  const licoesVisiveis = licoes
    .filter((l) => filtro === 'Todas' || l.status === filtro)
    .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega))

  if (carregando) {
    return <p className="carregando">Carregando...</p>
  }

  // Quantas lições existem em cada filtro, para mostrar ao lado do nome
  const contagem = (opcao: Filtro) =>
    opcao === 'Todas' ? licoes.length : licoes.filter((l) => l.status === opcao).length

  const pendentes = contagem('Pendente')

  return (
    <section>
      <div className="pagina-topo">
        <div>
          <h1>Lições</h1>
          <p className="pagina-subtitulo">
            {pendentes === 0
              ? 'Nenhuma lição pendente.'
              : pendentes === 1
                ? '1 lição pendente.'
                : `${pendentes} lições pendentes.`}
          </p>
        </div>
        <Link to="/licoes/nova" state={{ de: '/licoes' }} className="botao">
          <IconeMais />
          Nova lição
        </Link>
      </div>

      {erro && <p className="erro">{erro}</p>}

      <div className="segmentos" role="tablist" aria-label="Filtrar por status">
        {FILTROS.map((opcao) => (
          <button
            key={opcao}
            role="tab"
            aria-selected={filtro === opcao}
            className={filtro === opcao ? 'segmento ativo' : 'segmento'}
            onClick={() => setFiltro(opcao)}
          >
            {opcao}
            <span className="segmento-contagem">{contagem(opcao)}</span>
          </button>
        ))}
      </div>

      {licoesVisiveis.length === 0 ? (
        <div className="vazio">
          <p>Nenhuma lição {filtro === 'Todas' ? 'cadastrada' : `com status "${filtro}"`}.</p>
        </div>
      ) : (
        <ul className="lista-licoes">
          {licoesVisiveis.map((licao) => (
            <LicaoCard
              key={licao.id}
              licao={licao}
              materia={materias.find((m) => m.id === licao.materiaId)}
              onConcluir={handleConcluir}
              onApagar={handleApagar}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
