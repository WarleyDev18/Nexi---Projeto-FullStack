# CLAUDE.md — Nexi Full-Stack (raiz)

Monorepo (npm workspaces) com três pacotes. Este arquivo dá a visão geral e as regras que valem
para **todos** eles. Cada pacote tem seu próprio `CLAUDE.md` com os padrões locais — leia o do
pacote que você vai editar.

## Visão geral

Aplicação para gerenciar projetos (e, no futuro, o que existe dentro deles). Três pacotes:

| Pacote | Papel | Depende de |
|---|---|---|
| `api/` | Servidor HTTP/JSON. Dono das regras de negócio e da validação. | — |
| `sdk/` | Cliente tipado da API. Única porta de saída do front para a rede. | contrato da `api/` |
| `dashboard/` | Interface web. Só apresenta e coleta dados. | `sdk/` |

Fluxo de dados: `dashboard → sdk → api`. Nunca pule uma camada (o dashboard não chama `fetch`
direto; o sdk não conhece React; a api não conhece o dashboard).

## Contrato entre os lados (vale para api, sdk e dashboard)

- Sucesso: `{ "data": <payload> }`. Erro: `{ "error": { "code", "message", "details?" } }`.
- `code` é uma string estável em `snake_case` (ex.: `validation_error`); o front decide
  comportamento pelo `code`, nunca pelo texto de `message`.
- JSON em `camelCase`; datas em ISO-8601 UTC; ids são strings opacas (uuid).
- Recursos no plural e em minúsculas na URL, sob o prefixo `/api`.
- Mudou o contrato de um endpoint → atualize **no mesmo trabalho** a api, o sdk e o dashboard
  que o consome. Contrato divergente entre pacotes é bug, mesmo que cada lado compile.

## Como trabalhar aqui

- Antes de criar algo, procure uma feature equivalente já existente e **siga o mesmo padrão**.
  Para entender a forma esperada de uma feature de ponta a ponta, use a feature de projetos como
  referência (api + sdk + dashboard).
- Mudança que atravessa pacotes: planeje na ordem contrato → api → sdk → dashboard.
- Escopo mínimo: não refatore código alheio à tarefa; não adicione dependência sem necessidade.
- Verificação antes de dar por concluído: testes da api passam e o build do dashboard fecha.

## Comandos (na raiz)

- `npm install` — instala tudo (workspaces).
- `npm run dev:api` / `npm run dev:dashboard` — desenvolvimento.
- `npm test` — testes da api. `npm run build` — build do dashboard.

## Regras gerais de código

- JavaScript ESM moderno, sem `any` implícito: documente tipos de fronteira com JSDoc.
- Nada de segredos no repositório; configuração por variável de ambiente.
- Mensagens de erro para o usuário em português; `code` e identificadores em inglês.
- Comentário explica o porquê, não o quê.
