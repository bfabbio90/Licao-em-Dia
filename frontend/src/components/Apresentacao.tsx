// Mensagem de boas-vindas das telas de login e cadastro:
// deixa claro que o app é para os pais, não para as crianças.
export default function Apresentacao() {
  return (
    <div className="apresentacao">
      <p className="apresentacao-titulo">Este App é para papais e mamães.</p>
      <p className="apresentacao-texto">Acompanhe os deveres de casa dos seus filhos.</p>
    </div>
  )
}
