using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHomework.Api.Data;
using MyHomework.Api.Models;

namespace MyHomework.Api.Controllers;

[ApiController]
[Route("api/licoes")]
[Authorize]
public class LicoesController : ControllerBase
{
    private readonly AppDbContext _context;

    public LicoesController(AppDbContext context)
    {
        _context = context;
    }

    // Id da conta que fez a requisição, lido da claim "sub" do token.
    // A rota exige [Authorize], então o token sempre existe aqui.
    private string IdDoUsuarioLogado => User.FindFirst("sub")!.Value;

    // Busca uma lição só se ela for da conta logada. A lição de outra conta
    // devolve null, e a rota responde 404, como se ela não existisse.
    private Task<Licao?> BuscarDoUsuario(int id) =>
        _context.Licoes.FirstOrDefaultAsync(l => l.Id == id && l.UsuarioId == IdDoUsuarioLogado);

    // GET: api/licoes
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var licoes = await _context.Licoes
            .Where(l => l.UsuarioId == IdDoUsuarioLogado)
            .ToListAsync();
        return Ok(licoes);
    }

    // GET: api/licoes/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var licao = await BuscarDoUsuario(id);
        if (licao == null) return NotFound();

        return Ok(licao);
    }

    // POST: api/licoes
    [HttpPost]
    public async Task<IActionResult> Create(Licao licao)
    {
        var materia = await _context.Materias.FindAsync(licao.MateriaId);
        if (materia == null) return BadRequest("Matéria não encontrada.");

        // Campos que só a API define (ignora o que vier no JSON)
        licao.CriadaEm = DateTime.Now;
        licao.AtualizadaEm = null;
        licao.Status = StatusLicao.Pendente;
        licao.ConcluidaEm = null;
        licao.UsuarioId = IdDoUsuarioLogado; // a lição é de quem criou

        _context.Licoes.Add(licao);
        await _context.SaveChangesAsync();

        return Ok(licao);
    }

    // PUT: api/licoes/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Licao dados)
    {
        var licao = await BuscarDoUsuario(id);
        if (licao == null) return NotFound();

        licao.Titulo = dados.Titulo;
        licao.Descricao = dados.Descricao;
        licao.DataEntrega = dados.DataEntrega;
        licao.Status = dados.Status;
        licao.MateriaId = dados.MateriaId;
        licao.AtualizadaEm = DateTime.Now;

        await _context.SaveChangesAsync();

        return Ok(licao);
    }

    // PATCH: api/licoes/5/concluir
    [HttpPatch("{id}/concluir")]
    public async Task<IActionResult> Concluir(int id)
    {
        var licao = await BuscarDoUsuario(id);
        if (licao == null) return NotFound();

        licao.Status = StatusLicao.Feita;
        licao.ConcluidaEm = DateTime.Now;
        licao.AtualizadaEm = DateTime.Now;

        await _context.SaveChangesAsync();

        return Ok(licao);
    }

    // DELETE: api/licoes/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var licao = await BuscarDoUsuario(id);
        if (licao == null) return NotFound();

        _context.Licoes.Remove(licao);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
