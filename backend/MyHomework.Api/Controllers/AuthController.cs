using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MyHomework.Api.DTOs;
using MyHomework.Api.Models;

namespace MyHomework.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<Usuario> _userManager;

        public AuthController(UserManager<Usuario> userManager)
        {
            _userManager = userManager;
        }

        // POST: api/auth/registrar
        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar(RegistroDto dto)
        {
            // Verifica se o e-mail já está cadastrado
            var existente = await _userManager.FindByEmailAsync(dto.Email);

            if (existente != null)
                return BadRequest("Este e-mail já está cadastrado.");

            // Cria o novo usuário
            var usuario = new Usuario
            {
                UserName = dto.Email,
                Email = dto.Email,
                Nome = dto.Nome
            };

            // Cria a conta com a senha informada
            var resultado = await _userManager.CreateAsync(usuario, dto.Senha);

            if (!resultado.Succeeded)
            {
                
                var erros = resultado.Errors.Select(e => e.Description);

                return BadRequest(string.Join(" ", erros));
            }

            // Toda conta nova começa como usuário comum
            await _userManager.AddToRoleAsync(usuario, Roles.Usuario);

            return Ok(new
            {
                mensagem = "Conta criada com sucesso."
            });
        }
    }
}
