import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  apagarLicao,
  concluirLicao,
  listarLicoes,
  listarMaterias,
  mensagemDeErro,
} from '../api/api'
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
    return <p>Carregando...</p>
  }

  return (
    <section>
      <div className="cabecalho">
        <h1>Lições</h1>
        <Link to="/licoes/nova" state={{ de: '/licoes' }} className="botao">
          + Nova lição
        </Link>
      </div>

      {erro && <p className="erro">{erro}</p>}

      <div className="filtros">
        {FILTROS.map((opcao) => (
          <button
            key={opcao}
            className={filtro === opcao ? 'filtro ativo' : 'filtro'}
            onClick={() => setFiltro(opcao)}
          >
            {opcao}
          </button>
        ))}
      </div>

      {licoesVisiveis.length === 0 ? (
        <p className="vazio">Nenhuma lição por aqui.</p>
      ) : (
        <div className="lista">
          {licoesVisiveis.map((licao) => (
            <LicaoCard
              key={licao.id}
              licao={licao}
              materia={materias.find((m) => m.id === licao.materiaId)}
              onConcluir={handleConcluir}
              onApagar={handleApagar}
            />
          ))}
        </div>
      )}
    </section>
  )
}
