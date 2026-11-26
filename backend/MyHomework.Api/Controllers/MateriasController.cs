using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHomework.Api.Data;
using MyHomework.Api.Models;

namespace MyHomework.Api.Controllers;

[ApiController]
[Route("api/materias")]
[Authorize]
public class MateriasController : ControllerBase
{
    private readonly AppDbContext _context;

    public MateriasController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/materias
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var materias = await _context.Materias.ToListAsync();
        return Ok(materias);
    }

    // GET: api/materias/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var materia = await _context.Materias.FindAsync(id);
        if (materia == null) return NotFound();

        return Ok(materia);
    }

    // POST: api/materias
    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Create(Materia materia)
    {
        materia.CriadaEm = DateTime.Now;

        _context.Materias.Add(materia);
        await _context.SaveChangesAsync();

        return Ok(materia);
    }

    // PUT: api/materias/1
    [HttpPut("{id}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(int id, Materia dados)
    {
        var materia = await _context.Materias.FindAsync(id);
        if (materia == null) return NotFound();

        materia.Nome = dados.Nome;
        materia.Icone = dados.Icone;

        await _context.SaveChangesAsync();

        return Ok(materia);
    }

    // DELETE: api/materias/1
    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        var materia = await _context.Materias.FindAsync(id);
        if (materia == null) return NotFound();

        // Não deixa apagar uma matéria que ainda tem lições
        bool temLicoes = await _context.Licoes.AnyAsync(l => l.MateriaId == id);
        if (temLicoes) return BadRequest("Essa matéria tem lições. Apague as lições primeiro.");

        _context.Materias.Remove(materia);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
