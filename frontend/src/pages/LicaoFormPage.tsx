import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { buscarLicao, criarLicao, editarLicao, listarMaterias, mensagemDeErro } from '../api/api'
import type { LicaoInput, Materia, StatusLicao } from '../types'
import { hojeISO } from '../utils/datas'

export default function LicaoFormPage() {
  const { id } = useParams() // só existe na rota de edição
  const editando = id !== undefined
  const navigate = useNavigate()

  const [materias, setMaterias] = useState<Materia[]>([])
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dataEntrega, setDataEntrega] = useState(hojeISO())
  const [materiaId, setMateriaId] = useState(0)
  const [status, setStatus] = useState<StatusLicao>('Pendente')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        const lista = await listarMaterias()
        setMaterias(lista)

        if (editando) {
          // Preenche o formulário com a lição que já existe
          const licao = await buscarLicao(Number(id))
          setTitulo(licao.titulo)
          setDescricao(licao.descricao ?? '')
          setDataEntrega(licao.dataEntrega.slice(0, 10))
          setMateriaId(licao.materiaId)
          setStatus(licao.status)
        } else if (lista.length > 0) {
          // Lição nova: já deixa a primeira matéria escolhida
          setMateriaId(lista[0].id)
        }
      } catch (e) {
        setErro(mensagemDeErro(e))
      }
    }
    carregar()
  }, [editando, id])

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault() // impede o navegador de recarregar a página
    setErro('')
    setSalvando(true)

    const dados: LicaoInput = {
      titulo,
      descricao: descricao.trim() === '' ? null : descricao,
      dataEntrega: `${dataEntrega}T00:00:00`,
      materiaId,
      status,
    }

    try {
      if (editando) {
        await editarLicao(Number(id), dados)
      } else {
        await criarLicao(dados)
      }
      navigate('/') // volta para a lista
    } catch (e) {
      setErro(mensagemDeErro(e))
      setSalvando(false)
    }
  }

  return (
    <section>
      <h1>{editando ? 'Editar lição' : 'Nova lição'}</h1>

      {erro && <p className="erro">{erro}</p>}

      <form className="formulario" onSubmit={handleSubmit}>
        <label>
          Título
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={120} required />
        </label>

        <label>
          Descrição (opcional)
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={500}
            rows={3}
          />
        </label>

        <label>
          Data de entrega
          <input
            type="date"
            value={dataEntrega}
            onChange={(e) => setDataEntrega(e.target.value)}
            required
          />
        </label>

        <label>
          Matéria
          <select value={materiaId} onChange={(e) => setMateriaId(Number(e.target.value))}>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>
                {`${m.icone} ${m.nome}`.trim()}
              </option>
            ))}
          </select>
        </label>

        {editando && (
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusLicao)}>
              <option value="Pendente">Pendente</option>
              <option value="Feita">Feita</option>
              <option value="Entregue">Entregue</option>
            </select>
          </label>
        )}

        <div className="acoes">
          <button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" className="botao-secundario" onClick={() => navigate('/')}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}
