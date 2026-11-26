import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import type { Licao, Materia } from '../types'
import { corDaMateria } from '../utils/cores'
import { estaAtrasada, formatarData } from '../utils/datas'
import { IconeCheck, IconeLapis, IconeLixeira } from './Icones'

interface LicaoCardProps {
  licao: Licao
  materia: Materia | undefined
  onConcluir: (id: number) => void
  onApagar: (id: number) => void
}

// Uma lição como linha da lista: concluir, título, matéria, data, status e ações
export default function LicaoCard({ licao, materia, onConcluir, onApagar }: LicaoCardProps) {
  const atrasada = estaAtrasada(licao)
  const pendente = licao.status === 'Pendente'
  const nomeMateria = materia ? `${materia.icone} ${materia.nome}`.trim() : 'Sem matéria'

  return (
    <li
      className={pendente ? 'licao' : 'licao licao-concluida'}
      style={{ '--cor': corDaMateria(licao.materiaId) } as CSSProperties}
    >
      <button
        className="licao-check"
        onClick={() => onConcluir(licao.id)}
        disabled={!pendente}
        aria-label={pendente ? `Marcar "${licao.titulo}" como feita` : `"${licao.titulo}" já foi feita`}
        title={pendente ? 'Marcar como feita' : undefined}
      >
        {!pendente && <IconeCheck tamanho={13} strokeWidth={3} />}
      </button>

      <div className="licao-texto">
        <span className="licao-titulo">{licao.titulo}</span>
        {licao.descricao && <span className="licao-descricao">{licao.descricao}</span>}
      </div>

      <span className="licao-materia">
        <span className="ponto-cor" />
        {nomeMateria}
      </span>

      <span className={atrasada ? 'licao-data atrasada' : 'licao-data'}>
        {formatarData(licao.dataEntrega)}
        {atrasada && <span className="etiqueta-atraso">Atrasada</span>}
      </span>

      <span className={`status status-${licao.status.toLowerCase()}`}>{licao.status}</span>

      <div className="licao-acoes">
        <Link
          to={`/licoes/${licao.id}/editar`}
          state={{ de: '/licoes' }}
          className="botao-icone"
          aria-label={`Editar "${licao.titulo}"`}
          title="Editar"
        >
          <IconeLapis />
        </Link>
        <button
          className="botao-icone botao-icone-perigo"
          onClick={() => onApagar(licao.id)}
          aria-label={`Apagar "${licao.titulo}"`}
          title="Apagar"
        >
          <IconeLixeira />
        </button>
      </div>
    </li>
  )
}
