# Transcrição — plan mode

Agente: subagente Plan do Claude Code (somente leitura, sem permissão de edição), com o monorepo
já contendo os `CLAUDE.md`.

## Prompt

> Você está em plan mode (somente leitura) no monorepo. Comece lendo o CLAUDE.md da raiz e os
> CLAUDE.md de cada pacote (api, sdk, dashboard).
>
> PEDIDO: "Planeje uma feature nova de TAREFAS: cada projeto passa a ter tarefas (título, status
> todo/doing/done, criada em). Deve ser possível listar as tarefas de um projeto, criar uma
> tarefa e mudar o status dela, na tela de projetos. Use a feature de PROJETOS já existente como
> referência de padrão, nos dois lados do monorepo."
>
> Entregue um plano em português, curto e concreto, em seções: (1) Referência encontrada;
> (2) Contrato; (3) Passos por pacote na ordem contrato → api → sdk → dashboard, dizendo qual
> regra dos CLAUDE.md cada passo respeita; (4) Testes e verificação; (5) Riscos/pontos de
> consistência entre api e dashboard. Não edite nada.

## Plano devolvido (sem edições)

### 1. Referência encontrada (feature de projetos)

**api**
- `app.js`: fábrica `createApp()` sem `listen`; monta `/api/projects`, depois `notFound` e `errorHandler`.
- `modules/projects/projects.routes.js`: `projectsRouter(service = ...)`; `GET /` e `POST /`; usa `schema.parse`, `asyncHandler`, `201` na criação.
- `projects.schema.js`: zod com `trim`/`min`/`max`/default e schema de query opcional.
- `projects.service.js`: regra de unicidade com `AppError(409, "project_name_taken")`, filtro `search`.
- `projects.repository.js`: `Map` em memória (`list`, `insert`, `findByName`), `randomUUID`, `createdAt` ISO.
- `lib/errors.js`: `AppError`, `notFound`, `errorHandler` (ZodError → `400 validation_error` com `details`).
- `test/projects.test.js`: `withServer` em porta efêmera; feliz, 400 com `details`, 409.

**sdk**
- `http.js`: `request()` desembrulha `{data}`, ignora query vazia, lança `ApiError`.
- `projects.js`: typedef `Project` e `projectsApi` (`list`, `create`).
- `index.js`: `createClient` devolve `{ projects }`.

**dashboard**
- `lib/client.js`: instância única `api`.
- `features/projects/useProjects.js`: `{status, items, error}`; `create` faz `await api...; await refresh()`.
- `features/projects/ProjectsPage.jsx`: erro de campo via `details.name[0]` ou `message`; estados loading/erro/vazio.

Lacunas que afetam a feature: não existe `GET /projects/:id` nem busca por id no repositório de
projetos; a página só lista nomes (sem seleção); sdk e dashboard não têm script de teste.

### 2. Contrato (envelope `{data}` / `{error}`, camelCase, ISO UTC, uuid)

| Operação | Endpoint | Entrada | Sucesso |
|---|---|---|---|
| Listar | `GET /api/projects/:projectId/tasks?status=todo\|doing\|done` | — | `200 {data: Task[]}` por `createdAt` desc |
| Criar | `POST /api/projects/:projectId/tasks` | `{ title }` (trim, 2–120) | `201 {data: Task}`, status inicial `todo` |
| Mudar status | `PATCH /api/tasks/:id` | `{ status }` | `200 {data: Task}` |

`Task = { id, projectId, title, status, createdAt }`.

Erros: `400 validation_error` (`details.title` / `details.status`), `404 project_not_found`,
`404 task_not_found`, `500 internal_error`. Sem `409` (não há unicidade de título).

Decisões a confirmar: PATCH em `/api/tasks/:id` (regra "item em /recurso/:id") vs. aninhado;
transições livres entre status (alternativa: `409 invalid_status_transition`).

### 3. Passos (contrato → api → sdk → dashboard)

**Passo 0 — Contrato.** Fechar a tabela antes de codar (regra da raiz).

**Passo 1 — api** (`api/CLAUDE.md`: módulo com 4 papéis; módulos não se importam; router com serviço injetável)
1. Criar o módulo de tarefas com schema, repositório, serviço e rotas, replicando projetos.
   Schemas: criação (`title`), atualização (`status` como enum), query (`status` opcional) e params.
   Repositório: `listByProject`, `insert`, `findById`, `updateStatus`. Serviço lança `task_not_found`/`project_not_found`.
2. Isolamento entre módulos: o serviço de tarefas precisa saber se o projeto existe, mas módulos
   não se importam. Propor injeção `createTasksService(repo, { projectExists })` montada na
   raiz de composição (`app.js`), o que exige `findById` aditivo no repositório de projetos e
   instanciá-lo uma única vez (mantendo o default para não quebrar `projects.test.js`).
3. Montar `/api/projects/:projectId/tasks` (`mergeParams`) e `/api/tasks/:id` antes do `notFound`.
4. Sinalizar que sdk e dashboard precisam acompanhar.

**Passo 2 — sdk** (`sdk/CLAUDE.md`: um grupo por módulo; verbos de negócio; typedef idêntico; sem validação duplicada)
1. `tasksApi`: `listByProject(projectId, query)`, `create(projectId, input)`, `updateStatus(id, status)`; typedef `Task`.
2. `createClient` passa a devolver `{ projects, tasks }`. `http.js` já suporta `PATCH`.

**Passo 3 — dashboard** (`dashboard/CLAUDE.md`: feature com hook; só via sdk; 4 estados de UI; recarregar após mutação)
1. Feature de tarefas com hook `useTasks(projectId)` (`create`, `setStatus` → `refresh()`) e um painel com lista, troca de status e formulário; erro de campo via `details.title[0]`, decisão por `code`; botão desabilitado durante envio.
2. Na página de projetos: seleção de projeto e renderização do painel, importando só o componente exportado.

### 4. Testes e verificação
- Teste de tarefas no estilo do de projetos: criar/listar (`todo`, 201), filtro por status, título inválido (400 + `details.title`), status inválido (400 + `details.status`), `project_not_found`, `task_not_found`, PATCH feliz refletido na listagem, isolamento entre projetos.
- `projects.test.js` segue passando (regressão da composição).
- Verificação final: `npm test` e `npm run build`; sdk e dashboard sem testes, então build + leitura (e rodada manual com os dois servidores).

### 5. Riscos e consistência api ↔ dashboard
- Nomes e enum (`status`, `projectId`, `createdAt`) idênticos em schema, typedef do sdk e UI; rótulos em português só na UI.
- Dependência entre módulos: injeção na composição; não instanciar o repositório de projetos duas vezes.
- Dois prefixos de rota e `mergeParams`; `notFound` por último; validar `params`.
- Persistência em memória (some ao reiniciar, igual a projetos).
- Front decide por `code`, nunca por `message` (ex.: projeto removido não quebra o painel).
- Corrida de UI: resposta antiga não pode sobrescrever a nova ao trocar de projeto.
- Empate de `createdAt` no mesmo ms na ordenação.
- Escopo: não refatorar além da seleção, sem novas dependências, `http.js` intacto.
