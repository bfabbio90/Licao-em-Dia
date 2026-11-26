using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHomework.Api.Data;
using MyHomework.Api.Models;

namespace MyHomework.Api.Controllers;

[ApiController]
[Route("api/licoes")]
public class LicoesController : ControllerBase
{
    private readonly AppDbContext _context;

    public LicoesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/licoes
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var licoes = await _context.Licoes.ToListAsync();
        return Ok(licoes);
    }

    // GET: api/licoes/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var licao = await _context.Licoes.FindAsync(id);
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

        _context.Licoes.Add(licao);
        await _context.SaveChangesAsync();

        return Ok(licao);
    }

    // PUT: api/licoes/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Licao dados)
    {
        var licao = await _context.Licoes.FindAsync(id);
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
        var licao = await _context.Licoes.FindAsync(id);
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
        var licao = await _context.Licoes.FindAsync(id);
        if (licao == null) return NotFound();

        _context.Licoes.Remove(licao);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
