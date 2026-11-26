using System.Text.Json.Serialization;

namespace MyHomework.Api.Models;

public class Materia
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;

    public string Icone { get; set; } = "📚";

    public DateTime CriadaEm { get; set; }

      [JsonIgnore]
    public List<Licao> Licoes { get; set; } = new();
}
