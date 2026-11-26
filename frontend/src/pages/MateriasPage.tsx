import { useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { apagarMateria, criarMateria, listarMaterias, mensagemDeErro } from '../api/api'
import { IconeLixeira, IconeMais } from '../components/Icones'
import { useAuth } from '../contexts/auth'
import type { Materia } from '../types'
import { corDaMateria } from '../utils/cores'

export default function MateriasPage() {
  // Só o Admin pode criar e apagar matérias (a API também confere)
  const { ehAdmin } = useAuth()
  const [materias, setMaterias] = useState<Materia[]>([])
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        setMaterias(await listarMaterias())
      } catch (e) {
        setErro(mensagemDeErro(e))
      }
    }
    carregar()
  }, [])

  async function handleCriar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro('')
    try {
      const nova = await criarMateria({ nome, icone })
      setMaterias((atuais) => [...atuais, nova])
      setNome('')
      setIcone('')
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  async function handleApagar(id: number) {
    if (!confirm('Apagar esta matéria?')) return
    setErro('')
    try {
      await apagarMateria(id)
      setMaterias((atuais) => atuais.filter((m) => m.id !== id))
    } catch (e) {
      // Ex.: "Essa matéria tem lições. Apague as lições primeiro."
      setErro(mensagemDeErro(e))
    }
  }

  return (
    <section className="pagina-estreita">
      <div className="pagina-topo">
        <div>
          <h1>Matérias</h1>
          <p className="pagina-subtitulo">
            {ehAdmin
              ? 'Cada matéria tem uma cor, usada no calendário e na lista.'
              : 'Só administradores podem cadastrar ou apagar matérias.'}
          </p>
        </div>
      </div>

      {erro && <p className="erro">{erro}</p>}

      {ehAdmin && (
        <form className="nova-materia" onSubmit={handleCriar}>
          <input
            placeholder="Nome da matéria"
            aria-label="Nome da matéria"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={60}
            required
          />
          <input
            className="campo-icone"
            placeholder="Ícone"
            aria-label="Ícone (opcional)"
            value={icone}
            onChange={(e) => setIcone(e.target.value)}
            maxLength={10}
          />
          <button type="submit">
            <IconeMais />
            Adicionar
          </button>
        </form>
      )}

      {materias.length === 0 ? (
        <div className="vazio">
          <p>Nenhuma matéria cadastrada.</p>
        </div>
      ) : (
        <ul className="lista-materias">
          {materias.map((m) => (
            <li key={m.id} style={{ '--cor': corDaMateria(m.id) } as CSSProperties}>
              <span className="ponto-cor" />
              <span className="materia-nome">{`${m.icone} ${m.nome}`.trim()}</span>
              {ehAdmin && (
                <button
                  className="botao-icone botao-icone-perigo"
                  onClick={() => handleApagar(m.id)}
                  aria-label={`Apagar ${m.nome}`}
                  title="Apagar"
                >
                  <IconeLixeira />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
