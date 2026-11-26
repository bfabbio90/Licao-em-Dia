// Topo das telas de login e cadastro: a marca do app e para quem ele é.
export default function Apresentacao() {
  return (
    <div className="apresentacao">
      <span className="marca-simbolo marca-simbolo-grande" aria-hidden="true">
        M
      </span>
      <p className="apresentacao-titulo">Este App é para papais e mamães.</p>
      <p className="apresentacao-texto">Acompanhe os deveres de casa dos seus filhos.</p>
    </div>
  )
}
