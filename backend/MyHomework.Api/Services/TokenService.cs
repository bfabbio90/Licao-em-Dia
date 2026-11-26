using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using MyHomework.Api.Models;

namespace MyHomework.Api.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GerarToken(Usuario usuario, IList<string> roles)
        {
            // 1. As informações que vão dentro do token (claims)
            var claims = new List<Claim>
            {
                new Claim("sub", usuario.Id),
                new Claim("email", usuario.Email!),
                new Claim("name", usuario.Nome)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim("role", role));
            }

            // 2. A chave secreta que assina o token
            var chave = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
            );

            var minutos = int.Parse(
                _config["Jwt:ExpiracaoMinutos"]!
            );

            // 3. Monta e assina o token
            var descricao = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),

                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],

                Expires = DateTime.UtcNow.AddMinutes(minutos),

                SigningCredentials = new SigningCredentials(
                    chave,
                    SecurityAlgorithms.HmacSha256
                )
            };

            return new JsonWebTokenHandler().CreateToken(descricao);
        }
    }
}
