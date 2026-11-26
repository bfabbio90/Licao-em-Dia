using Microsoft.AspNetCore.Identity;

namespace MyHomework.Api.Models
{
    // Herda tudo do IdentityUser (Id, Email, PasswordHash...)
    // e acrescenta o campo Nome.
    public class Usuario : IdentityUser
    {
        public string Nome { get; set; } = string.Empty;
    }
}
