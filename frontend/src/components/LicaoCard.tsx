import { Link } from 'react-router'
import type { Licao, Materia } from '../types'
import { corDaMateria } from '../utils/cores'
import { estaAtrasada, formatarData } from '../utils/datas'

interface LicaoCardProps {
  licao: Licao
  materia: Materia | undefined
  onConcluir: (id: number) => void
  onApagar: (id: number) => void
}

export default function LicaoCard({ licao, materia, onConcluir, onApagar }: LicaoCardProps) {
  const atrasada = estaAtrasada(licao)

  return (
    <article className="card" style={{ borderLeftColor: corDaMateria(licao.materiaId) }}>
      <div className="card-topo">
        <span className="materia">{materia ? `${materia.icone} ${materia.nome}` : 'Sem matéria'}</span>
        <span className={`status status-${licao.status.toLowerCase()}`}>{licao.status}</span>
      </div>

      <h3>{licao.titulo}</h3>
      {licao.descricao && <p className="descricao">{licao.descricao}</p>}

      <p className={atrasada ? 'data atrasada' : 'data'}>
        Entrega: {formatarData(licao.dataEntrega)}
        {atrasada && ' · atrasada'}
      </p>

      <div className="acoes">
        {licao.status === 'Pendente' && (
          <button onClick={() => onConcluir(licao.id)}>Marcar como feita</button>
        )}
        <Link to={`/licoes/${licao.id}/editar`} className="botao botao-secundario">
          Editar
        </Link>
        <button className="botao-perigo" onClick={() => onApagar(licao.id)}>
          Apagar
        </button>
      </div>
    </article>
  )
}
