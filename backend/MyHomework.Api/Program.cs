using Microsoft.AspNetCore.Identity;
using MyHomework.Api.Models;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using MyHomework.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Banco de dados (MySQL)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(builder.Configuration.GetConnectionString("Default")!));

// 2. Identity: usuários, senhas e roles
builder.Services
    .AddIdentityCore<Usuario>(options =>
    {
        // Exige que o e-mail seja único
        options.User.RequireUniqueEmail = true;

        // Configurações de senha
        options.Password.RequiredLength = 6;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

// 3. Controllers + enums como texto no JSON ("Pendente" em vez de 0)
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// 4. Swagger, para testar a API no navegador
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 5. CORS: libera o React (o Vite roda na porta 5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// 6. Cria as roles e o primeiro admin, se ainda não existirem.
using (var scope = app.Services.CreateScope())
{
    await SeedData.CriarRolesEAdminAsync(
        scope.ServiceProvider,
        app.Configuration
    );
}

// 7. Liga o Swagger só no modo Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 8. Aplica o CORS e conecta os controllers
app.UseCors("Frontend");
app.MapControllers();

// 9. Liga a API
app.Run();
