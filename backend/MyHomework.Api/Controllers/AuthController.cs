using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MyHomework.Api.DTOs;
using MyHomework.Api.Models;
using MyHomework.Api.Services;

namespace MyHomework.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<Usuario> _userManager;
        private readonly TokenService _tokenService;

        public AuthController(
            UserManager<Usuario> userManager,
            TokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        // POST: api/auth/registrar
        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar(RegistroDto dto)
        {
            var existente = await _userManager.FindByEmailAsync(dto.Email);

            if (existente != null)
                return BadRequest("Este e-mail já está cadastrado.");

            var usuario = new Usuario
            {
                UserName = dto.Email,
                Email = dto.Email,
                Nome = dto.Nome
            };

            var resultado = await _userManager.CreateAsync(usuario, dto.Senha);

            if (!resultado.Succeeded)
            {
                // Ex.: a senha não seguiu as regras.
                var erros = resultado.Errors.Select(e => e.Description);

                return BadRequest(string.Join(" ", erros));
            }

            // Toda conta nova começa como usuário comum.
            await _userManager.AddToRoleAsync(usuario, Roles.Usuario);

            return Ok(new
            {
                mensagem = "Conta criada com sucesso."
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var usuario = await _userManager.FindByEmailAsync(dto.Email);

            // Mesma mensagem nos dois casos, para não revelar
            // quais e-mails existem.
            if (usuario == null ||
                !await _userManager.CheckPasswordAsync(usuario, dto.Senha))
            {
                return Unauthorized("E-mail ou senha inválidos.");
            }

            var roles = await _userManager.GetRolesAsync(usuario);

            var token = _tokenService.GerarToken(usuario, roles);

            return Ok(new LoginRespostaDto
            {
                Token = token,
                Nome = usuario.Nome,
                Email = usuario.Email!,
                Roles = roles
            });
        }

        // GET: api/auth/me
        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(new
            {
                id = User.FindFirst("sub")?.Value,
                nome = User.Identity?.Name,
                email = User.FindFirst("email")?.Value,
                roles = User.FindAll("role").Select(c => c.Value)
            });
        }
    }
}
