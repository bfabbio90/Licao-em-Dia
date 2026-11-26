import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { apagarMateria, criarMateria, listarMaterias, mensagemDeErro } from '../api/api'
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
    <section>
      <h1>Matérias</h1>

      {erro && <p className="erro">{erro}</p>}

      {ehAdmin ? (
        <form className="formulario em-linha" onSubmit={handleCriar}>
          <input
            placeholder="Nome da matéria"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={60}
            required
          />
          <input
            className="campo-icone"
            title="Ícone (opcional)"
            value={icone}
            onChange={(e) => setIcone(e.target.value)}
            maxLength={10}
          />
          <button type="submit">Adicionar</button>
        </form>
      ) : (
        <p className="dica">Só administradores podem cadastrar ou apagar matérias.</p>
      )}

      <ul className="lista-materias">
        {materias.map((m) => (
          <li key={m.id} style={{ borderLeftColor: corDaMateria(m.id) }}>
            <span>{`${m.icone} ${m.nome}`.trim()}</span>
            {ehAdmin && (
              <button className="botao-perigo" onClick={() => handleApagar(m.id)}>
                Apagar
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
