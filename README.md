# MyHomework

Aplicação para organizar lições de casa por matéria. Cada matéria agrupa suas lições, e cada lição tem título, descrição, data de entrega e um status que acompanha o andamento (pendente, feita ou entregue).

O repositório tem duas partes: uma API em ASP.NET Core, já concluída, e uma interface em React, em desenvolvimento. No frontend já existem a configuração do projeto, os tipos dos dados e as funções que chamam a API; as telas ainda estão sendo feitas.

## Tecnologias

**Backend**

- .NET 10 e ASP.NET Core (Web API com controllers)
- Entity Framework Core 10 com o provedor oficial do MySQL (`MySql.EntityFrameworkCore`)
- MySQL
- Swagger (Swashbuckle) para documentar e testar os endpoints

**Frontend**

- React 19 com TypeScript
- Vite como servidor de desenvolvimento e bundler
- `fetch` nativo para falar com a API, sem bibliotecas extras

## Estrutura

```
backend/
  MyHomework.slnx
  MyHomework.Api/
    Controllers/   endpoints de matérias e lições
    Data/          AppDbContext: tabelas, regras e dados iniciais
    Migrations/    histórico do esquema do banco
    Models/        classes Materia e Licao
    Program.cs     configuração da API (banco, JSON, Swagger, CORS)
frontend/
  .env.example     modelo da variável com o endereço da API
  index.html
  src/
    api/api.ts     todas as chamadas à API em um só lugar
    utils/datas.ts formatação de datas e regra de lição atrasada
    types.ts       formato dos dados que a API devolve e recebe
    App.tsx        componente principal
    main.tsx       ponto de entrada do React
```

## Como o frontend fala com a API

As telas não chamam a API diretamente: elas pedem os dados às funções de `api.ts`, e só esse arquivo faz as requisições HTTP. A API, por sua vez, é a única que acessa o MySQL.

![Diagrama: as telas do React chamam o api.ts, que fala com a API em C# por HTTP e JSON; a API acessa o MySQL](docs/arquitetura-frontend.png)

O diagrama mostra o frontend como ele vai ficar. As telas (`LicoesPage`, `LicaoFormPage`, `MateriasPage`) e o componente `LicaoCard` ainda não foram criados; o `api.ts` já existe.

## Modelo de dados

Uma matéria tem várias lições, e cada lição pertence a uma única matéria.

**Materia**

| Campo    | Tipo     | Observação                    |
|----------|----------|-------------------------------|
| Id       | int      | chave primária                |
| Nome     | string   | obrigatório, até 60 caracteres |
| Icone    | string   | opcional, até 10 caracteres   |
| CriadaEm | DateTime | preenchido pela API           |

**Licao**

| Campo        | Tipo      | Observação                              |
|--------------|-----------|-----------------------------------------|
| Id           | int       | chave primária                          |
| Titulo       | string    | obrigatório, até 120 caracteres         |
| Descricao    | string    | opcional, até 500 caracteres            |
| DataEntrega  | DateTime  |                                         |
| Status       | enum      | `Pendente`, `Feita` ou `Entregue`       |
| ConcluidaEm  | DateTime? | preenchido ao concluir a lição          |
| CriadaEm     | DateTime  | preenchido pela API                     |
| AtualizadaEm | DateTime? | preenchido pela API a cada edição       |
| MateriaId    | int       | chave estrangeira para `Materia`        |

O status é gravado no banco como texto e aparece assim no JSON (`"Pendente"`, e não `0`).

Uma matéria só pode ser apagada se não tiver lições. Essa regra existe no banco (`DeleteBehavior.Restrict`) e também no controller, que responde com `400` em vez de deixar o banco recusar.

A migration inicial já cadastra quatro matérias: Letras, Números, Artes e Natureza.

## Como rodar

### Requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- MySQL rodando localmente (porta 3306)
- Ferramenta do Entity Framework: `dotnet tool install -g dotnet-ef`
- [Node.js](https://nodejs.org/) 20.19 ou 22.12 em diante, para o frontend

### Backend

#### 1. Configurar a conexão com o banco

A senha do banco não fica no repositório. Em desenvolvimento ela é guardada com o User Secrets do .NET, que salva os dados fora da pasta do projeto:

```bash
cd backend/MyHomework.Api
dotnet user-secrets set "ConnectionStrings:Default" "server=localhost;port=3306;database=myhomework;user=root;password=SUA_SENHA"
```

O `appsettings.Development.json` traz a mesma connection string com a senha em branco, só como referência do formato.

#### 2. Criar o banco

```bash
dotnet ef database update
```

O comando cria o banco `myhomework`, as tabelas e as matérias iniciais.

#### 3. Subir a API

```bash
dotnet run
```

A API fica em `http://localhost:5229`, e a documentação do Swagger em `http://localhost:5229/swagger`.

### Frontend

Com a API rodando, abra outro terminal:

```bash
cd frontend
npm install
```

Crie o arquivo `.env.local` a partir do modelo. Ele guarda o endereço da API e não vai para o repositório:

```bash
cp .env.example .env.local
```

No Windows (PowerShell), use `Copy-Item .env.example .env.local`. Se a sua API estiver em outra porta, ajuste o valor de `VITE_API_URL`.

Depois suba o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend fica em `http://localhost:5173`, endereço que a API já libera no CORS.

## Endpoints

### Matérias

| Método | Rota                 | Descrição                                      |
|--------|----------------------|------------------------------------------------|
| GET    | `/api/materias`      | lista todas as matérias                        |
| GET    | `/api/materias/{id}` | busca uma matéria                              |
| POST   | `/api/materias`      | cria uma matéria                               |
| PUT    | `/api/materias/{id}` | altera nome e ícone                            |
| DELETE | `/api/materias/{id}` | apaga a matéria, se ela não tiver lições       |

### Lições

| Método | Rota                         | Descrição                                   |
|--------|------------------------------|---------------------------------------------|
| GET    | `/api/licoes`                | lista todas as lições                       |
| GET    | `/api/licoes/{id}`           | busca uma lição                             |
| POST   | `/api/licoes`                | cria uma lição                              |
| PUT    | `/api/licoes/{id}`           | edita uma lição                             |
| PATCH  | `/api/licoes/{id}/concluir`  | marca a lição como feita                    |
| DELETE | `/api/licoes/{id}`           | apaga uma lição                             |

Exemplo de corpo para criar uma lição:

```json
{
  "titulo": "Ler o capítulo 1",
  "descricao": "Páginas 10 a 15",
  "dataEntrega": "2026-12-01T00:00:00",
  "materiaId": 2
}
```

Ao criar uma lição, a API ignora o que vier em `status`, `criadaEm`, `atualizadaEm` e `concluidaEm`: toda lição nova começa como `Pendente`. Se o `materiaId` não existir, a resposta é `400`.

## Próximos passos

- Telas do frontend: lista de lições, formulário de lição e matérias
- Validar a matéria também na edição de lições
