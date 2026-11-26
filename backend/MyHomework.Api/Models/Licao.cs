using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace MyHomework.Api.Models;

public enum StatusLicao
{
    Pendente,
    Feita,
    Entregue
}

public class Licao
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataEntrega { get; set; }
    public StatusLicao Status { get; set; } = StatusLicao.Pendente;
    public DateTime? ConcluidaEm { get; set; }
    public DateTime CriadaEm { get; set; }
    public DateTime? AtualizadaEm { get; set; }

    // Chave estrangeira: o Id da matéria desta lição
    public int MateriaId { get; set; }

    [JsonIgnore]
    public Materia? Materia { get; set; }

    // Dono da lição: a conta que a criou. Quem preenche é a API, a partir do
    // token. [JsonIgnore] esconde o campo do JSON (o cliente não envia nem recebe)
    // e [ValidateNever] evita que a validação exija o campo no POST e no PUT.
    [JsonIgnore]
    [ValidateNever]
    public string UsuarioId { get; set; } = string.Empty;

    [JsonIgnore]
    [ValidateNever]
    public Usuario? Usuario { get; set; }
}
