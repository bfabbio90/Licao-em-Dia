using Microsoft.AspNetCore.Identity;
using MyHomework.Api.Models;

namespace MyHomework.Api.Data
{
    public static class SeedData
    {
        public static async Task CriarRolesEAdminAsync(
            IServiceProvider services,
            IConfiguration config)
        {
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = services.GetRequiredService<UserManager<Usuario>>();

            // 1. Cria as roles, se ainda não existirem.
            foreach (var role in new[] { Roles.Admin, Roles.Usuario })
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // 2. Cria o primeiro admin com os dados do User Secrets.
            var email = config["AdminInicial:Email"];
            var senha = config["AdminInicial:Senha"];

            // Sem configuração, não cria o admin.
            if (string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(senha))
            {
                return;
            }

            // Se o admin já existe, não cria novamente.
            if (await userManager.FindByEmailAsync(email) != null)
            {
                return;
            }

            var admin = new Usuario
            {
                UserName = email,
                Email = email,
                Nome = "Administrador"
            };

            var resultado = await userManager.CreateAsync(admin, senha);

            // Se a criação foi bem-sucedida, adiciona a role Admin.
            if (resultado.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, Roles.Admin);
            }
        }
    }
}
