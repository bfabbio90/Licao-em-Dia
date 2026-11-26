// Topo das telas de login e cadastro: a marca do app e para quem ele é.
export default function Apresentacao() {
  return (
    <div className="apresentacao">
      <img className="logo-grande" src="/logo.png" alt="Lição Em Dia" />
      <p className="apresentacao-titulo">Este App é para papais e mamães.</p>
      <p className="apresentacao-texto">Acompanhe os deveres de casa dos seus filhos.</p>
    </div>
  )
}
