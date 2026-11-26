using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using MyHomework.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Banco de dados (MySQL)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(builder.Configuration.GetConnectionString("Default")!));

// 2. Controllers + enums como texto no JSON ("Pendente" em vez de 0)
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// 3. Swagger, para testar a API no navegador
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. CORS: libera o React (o Vite roda na porta 5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// 5. Liga o Swagger só no modo Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 6. Aplica o CORS e conecta os controllers
app.UseCors("Frontend");
app.MapControllers();

// 7. Liga a API
app.Run();
