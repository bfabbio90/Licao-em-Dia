# MyHomework — Backend

API REST em **ASP.NET Core (.NET 10)** que guarda usuários, matérias e lições num banco **MySQL**. A autenticação usa **ASP.NET Core Identity** com **tokens JWT**.

Visão geral do projeto, telas e fluxo de autenticação: [README principal](../README.md).

## Stack

| Pacote | Para quê |
|--------|----------|
| `Microsoft.EntityFrameworkCore.Design` | migrations (`dotnet ef`) |
| `MySql.EntityFrameworkCore` | provedor oficial do MySQL para o EF Core |
| `Microsoft.AspNetCore.Identity.EntityFrameworkCore` | usuários, hash de senha e roles, guardados no mesmo banco |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | validação do token em cada requisição |
| `Swashbuckle.AspNetCore` | Swagger, com o botão Authorize |

## Estrutura

```
backend/
  MyHomework.slnx              solution
  MyHomework.Api/
    Controllers/
      AuthController.cs        cadastro, login e /me
      LicoesController.cs      CRUD de lições, sempre filtrado pela conta logada
      MateriasController.cs    CRUD de matérias (escrita só para Admin)
    Data/
      AppDbContext.cs          tabelas, relacionamentos e matérias iniciais
      SeedData.cs              cria as roles e o primeiro admin ao subir a API
    DTOs/
      AuthDtos.cs              RegistroDto, LoginDto e LoginRespostaDto
    Models/
      Licao.cs                 lição e o enum StatusLicao
      Materia.cs               matéria
      Usuario.cs               IdentityUser + Nome
      Roles.cs                 nomes das roles (Admin e Usuario)
    Services/
      TokenService.cs          gera o JWT no login
    Migrations/                histórico do esquema do banco
    Program.cs                 configuração da aplicação
    appsettings.json           configurações que não são segredo (JWT: emissor, público, expiração)
```

## Como rodar

**Requisitos:** .NET SDK 10, MySQL na porta 3306 e a ferramenta do EF (`dotnet tool install -g dotnet-ef`).

```bash
cd backend/MyHomework.Api

# segredos (ficam fora do repositório)
dotnet user-secrets set "ConnectionStrings:Default" "server=localhost;port=3306;database=myhomework;user=root;password=SUA_SENHA"
dotnet user-secrets set "Jwt:Key" "UMA-CHAVE-ALEATORIA-COM-32-OU-MAIS-CARACTERES"
dotnet user-secrets set "AdminInicial:Email" "admin@exemplo.com"
dotnet user-secrets set "AdminInicial:Senha" "SUA_SENHA_DE_ADMIN"

dotnet ef database update
dotnet run
```

- API: `http://localhost:5229`
- Swagger: `http://localhost:5229/swagger` (só no ambiente Development)

Para parar, `Ctrl + C`. Com a API aberta, um novo `dotnet build` falha com "arquivo sendo usado por outro processo".

## Configuração

| Chave | Onde fica | Para quê |
|-------|-----------|----------|
| `ConnectionStrings:Default` | User Secrets | conexão com o MySQL |
| `Jwt:Key` | User Secrets | chave que assina os tokens (32+ caracteres). Sem ela, a API não sobe |
| `AdminInicial:Email` e `AdminInicial:Senha` | User Secrets | primeiro administrador. Sem eles, nenhum admin é criado |
| `Jwt:Issuer`, `Jwt:Audience`, `Jwt:ExpiracaoMinutos` | `appsettings.json` | emissor, público e validade do token (120 minutos) |

O `appsettings.Development.json` traz a connection string com a senha em branco, só como referência do formato.

## Como funciona

### Pipeline (`Program.cs`)

1. **Banco:** `AppDbContext` com o provedor do MySQL.
2. **Identity:** `AddIdentityCore<Usuario>` com roles e as regras de senha (6+ caracteres, um número e uma letra minúscula; e-mail único).
3. **JWT:** valida emissor, público, validade e assinatura. `MapInboundClaims = false` mantém os nomes curtos das claims (`sub`, `name`, `role`).
4. **Controllers:** enums viram texto no JSON (`"Pendente"`, e não `0`).
5. **Swagger** com o esquema `bearer`, e **CORS** liberando `http://localhost:5173`.
6. Ao subir: o `SeedData` cria as roles e o admin inicial.
7. Middlewares, nesta ordem: `UseCors` → `UseAuthentication` → `UseAuthorization` → `MapControllers`.

### Autenticação

- **Cadastro** (`POST /api/auth/registrar`): recebe um `RegistroDto`, cria o usuário com `UserManager.CreateAsync` (o Identity gera o hash) e coloca na role `Usuario`. Erros de senha voltam como `400`.
- **Login** (`POST /api/auth/login`): confere a senha com `CheckPasswordAsync`, busca as roles e chama o `TokenService`. E-mail inexistente e senha errada recebem a mesma resposta (`401`).
- **Token:** claims `sub` (id), `email`, `name` e uma `role` por role, assinado com HMAC-SHA256.
- **Permissões:** `[Authorize]` nos controllers de lições e matérias; `[Authorize(Roles = Roles.Admin)]` em criar, editar e apagar matérias.

### Lições por conta

- `Licao.UsuarioId` é o dono. Ele tem `[JsonIgnore]` (não entra nem sai no JSON) e `[ValidateNever]` (o POST e o PUT não exigem o campo).
- No `LicoesController`, `IdDoUsuarioLogado` lê a claim `sub`. O POST grava o dono, e todas as outras rotas buscam com `BuscarDoUsuario(id)`, que filtra pelo dono. A lição de outra conta responde `404`.
- Apagar uma conta apaga as lições dela (`DeleteBehavior.Cascade`).

### Regras nos controllers

- Criar lição: a matéria precisa existir (senão `400`); status começa `Pendente`; `CriadaEm` é preenchido pela API.
- Concluir lição: status vira `Feita` e grava `ConcluidaEm`.
- Apagar matéria: só se não tiver lições (`400` com mensagem); o banco também impede (`DeleteBehavior.Restrict`).

## Banco de dados

| Migration | O que faz |
|-----------|-----------|
| `Inicial` | tabelas `Materias` e `Licoes` e as quatro matérias iniciais |
| `AdicionaIdentity` | tabelas do Identity (`AspNetUsers`, `AspNetRoles`, `AspNetUserRoles` e auxiliares) |
| `LicaoComUsuario` | coluna `UsuarioId` em `Licoes` com chave estrangeira para `AspNetUsers`. Apaga as lições que não tinham dono |

Para mudar o modelo:

```bash
dotnet ef migrations add NomeDaMudanca   # gera a migration a partir das classes
dotnet ef database update                # aplica no banco
```

Confira o arquivo gerado antes de aplicar, principalmente quando a mudança afeta dados que já existem.

## Como adicionar um endpoint

1. Crie ou altere o model em `Models/` e a configuração em `AppDbContext`, se precisar.
2. Gere e aplique a migration.
3. Crie a ação no controller com `[Authorize]` (ou `[Authorize(Roles = Roles.Admin)]`).
4. Se a rota mexe em lições, use `BuscarDoUsuario` e `IdDoUsuarioLogado` para respeitar o dono.
5. Teste no Swagger com o botão Authorize.
