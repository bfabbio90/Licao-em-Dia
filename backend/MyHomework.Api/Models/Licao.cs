using System.Text.Json.Serialization;

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
}
