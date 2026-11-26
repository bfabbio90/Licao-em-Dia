# Lição Em Dia — Frontend

Interface em **React 19 + TypeScript**, criada com **Vite**. Consome a API do backend, com login por token JWT. Não usa biblioteca de componentes nem de estado: só React, React Router, `fetch` nativo e CSS puro.

Visão geral do projeto, telas e fluxo de autenticação: [README principal](../README.md).

## Como rodar

**Requisitos:** Node.js 20.19+ e a API rodando (veja o [README do backend](../backend/README.md)).

```bash
cd frontend
npm install
cp .env.example .env.local   # no PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Site em `http://localhost:5173`, endereço que a API já libera no CORS.

| Script | O que faz |
|--------|-----------|
| `npm run dev` | servidor de desenvolvimento, com recarga automática |
| `npm run build` | confere os tipos (`tsc -b`) e gera o build em `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | serve o build de `dist/` |

### Variável de ambiente

| Variável | Exemplo | Para quê |
|----------|---------|----------|
| `VITE_API_URL` | `http://localhost:5229` | endereço da API |

Fica no `.env.local`, que não vai para o repositório. Se a API estiver em outra porta, ajuste aqui.

## Estrutura

```
frontend/src/
  api/
    api.ts               todas as chamadas à API (uma função por endpoint)
    sessao.ts            guarda o usuário logado e o token no localStorage; confere se o token venceu
  components/
    Navbar.tsx           barra superior: links, nome do usuário e Sair
    RotaProtegida.tsx    manda para /login quem não está logado
    LicaoCard.tsx        uma lição como linha da lista
    CampoData.tsx        campo de data dd/mm/aaaa com calendário próprio
    Apresentacao.tsx     mensagem das telas de login e cadastro
    Icones.tsx           ícones SVG (traço, herdam a cor do texto)
  contexts/
    auth.ts              contexto do login e o hook useAuth()
    AuthProvider.tsx     guarda quem está logado; entrar e sair
  pages/
    CalendarioPage.tsx   página inicial: resumo, grade do mês e painel do dia
    LicoesPage.tsx       lista com filtro por status
    LicaoFormPage.tsx    criar e editar lição
    MateriasPage.tsx     lista de matérias (admin cadastra e apaga)
    LoginPage.tsx        login
    RegistroPage.tsx     cadastro
  utils/
    datas.ts             datas no fuso local, grade do mês, nomes em português, regra de atraso
    cores.ts             cor de cada matéria
  types.ts               tipos dos dados da API
  App.tsx                rotas
  index.css              estilos e tokens de design
```

## Rotas

| Rota | Tela | Acesso |
|------|------|--------|
| `/login` | `LoginPage` | público |
| `/registrar` | `RegistroPage` | público |
| `/` | `CalendarioPage` | logado |
| `/licoes` | `LicoesPage` | logado |
| `/licoes/nova` | `LicaoFormPage` (aceita `?data=2026-11-27`) | logado |
| `/licoes/:id/editar` | `LicaoFormPage` | logado |
| `/materias` | `MateriasPage` | logado |

As rotas protegidas ficam dentro de `<RotaProtegida />` no `App.tsx`. Qualquer outro endereço volta para `/`.

## Como funciona

### Chamadas à API (`api/api.ts`)

- Todas passam pela função `requisicao`, que monta a URL com `VITE_API_URL`, envia o JSON e lê a resposta.
- Se há usuário logado, envia `Authorization: Bearer <token>`. Se o token já venceu, nem chama a API.
- `401` numa rota protegida: apaga a sessão e dispara um evento que o `AuthProvider` escuta. A tela volta para o login com "Sua sessão expirou".
- `403`: mostra "Você não tem permissão para fazer isso."
- Outros erros viram uma frase: a mensagem da API ou os erros de validação do ASP.NET juntos.

### Login (`contexts/`)

- `useAuth()` dá `usuario`, `ehAdmin`, `sessaoExpirou`, `entrar()` e `sair()`.
- Ao abrir o site, o `AuthProvider` recupera a sessão do `localStorage`, se o token ainda valer.
- Depois do cadastro, a tela vai para o login com o e-mail preenchido. O login automático não acontece.
- `ehAdmin` esconde o que a conta não pode fazer, como os botões de matéria. Quem garante a permissão de verdade é a API.

### Datas (`utils/datas.ts`)

- A API manda datas como `"2026-11-27T00:00:00"`; o front usa os 10 primeiros caracteres.
- `deISO` cria o `Date` no fuso local. `new Date("2026-11-27")` seria lido em UTC e, no Brasil, cairia no dia anterior.
- `diasDaGrade` monta a grade do mês, de domingo a sábado. `nomeDoMes` e `diaPorExtenso` usam `Intl` em português.
- `deDataBR` converte `dd/mm/aaaa` para o formato da API e recusa datas que não existem, como `31/04`.

### Formulário de lição

- Volta para a tela de onde foi aberto: quem abre envia `state: { de: '/licoes' }` ou `{ de: '/' }`.
- Vindo de um dia do calendário, recebe `?data=` e já preenche a data.

## Estilo

- CSS puro em `index.css`, organizado por seção (tokens, botões, campos, navbar, páginas, calendário, telas menores).
- Tokens no `:root`: cores (`--fundo`, `--superficie`, `--borda`, `--texto`, `--primaria` e as cores de status), raio e sombras. Use os tokens em vez de cores soltas.
- Fonte Geist (Google Fonts) e números com largura fixa, para alinhar datas e contagens.
- Cor da matéria: `corDaMateria(id)` passa a cor para o CSS na variável `--cor`. A paleta não tem vermelho nem verde puros, que já significam "atrasada" e "feita".
- Responsivo: abaixo de 960px o painel do calendário vai para baixo e as linhas da lista se reorganizam; abaixo de 720px os links da navbar descem e o calendário mostra bolinhas.

## Como adicionar uma tela

1. Crie o componente em `pages/`.
2. Se ela chama a API, adicione a função em `api.ts` e os tipos em `types.ts`.
3. Registre a rota no `App.tsx`, dentro de `<RotaProtegida />` se exigir login.
4. Use as classes que já existem (`pagina-topo`, `pagina-subtitulo`, `formulario`, `vazio`, `erro`) para manter o visual.
5. Rode `npm run lint` e `npm run build` antes de commitar.
