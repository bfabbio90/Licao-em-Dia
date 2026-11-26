using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MyHomework.Api.Models;

namespace MyHomework.Api.Data
{
    public class AppDbContext : IdentityDbContext<Usuario>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Materia> Materias => Set<Materia>();
        public DbSet<Licao> Licoes => Set<Licao>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Primeiro, o Identity configura as tabelas dele.
            base.OnModelCreating(modelBuilder);

            // Configuração do usuário
            modelBuilder.Entity<Usuario>(e =>
            {
                e.Property(u => u.Nome)
                    .HasMaxLength(100)
                    .IsRequired();
            });

            // Configuração da matéria
            modelBuilder.Entity<Materia>(e =>
            {
                e.Property(m => m.Nome)
                    .HasMaxLength(60)
                    .IsRequired();

                e.Property(m => m.Icone)
                    .HasMaxLength(10);

                // Matérias iniciais, criadas junto com a migration.
                e.HasData(
                    new Materia
                    {
                        Id = 1,
                        Nome = "Letras",
                        CriadaEm = new DateTime(2026, 1, 1)
                    },
                    new Materia
                    {
                        Id = 2,
                        Nome = "Números",
                        CriadaEm = new DateTime(2026, 1, 1)
                    },
                    new Materia
                    {
                        Id = 3,
                        Nome = "Artes",
                        CriadaEm = new DateTime(2026, 1, 1)
                    },
                    new Materia
                    {
                        Id = 4,
                        Nome = "Natureza",
                        CriadaEm = new DateTime(2026, 1, 1)
                    }
                );
            });

            // Configuração da lição
            modelBuilder.Entity<Licao>(e =>
            {
                e.Property(l => l.Titulo)
                    .HasMaxLength(120)
                    .IsRequired();

                e.Property(l => l.Descricao)
                    .HasMaxLength(500);

               
                e.Property(l => l.Status)
                    .HasConversion<string>()
                    .HasMaxLength(20);

              
                e.HasOne(l => l.Materia)
                    .WithMany(m => m.Licoes)
                    .HasForeignKey(l => l.MateriaId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
