# CLAUDE.md — api/

Padrões do servidor. Complementam o `CLAUDE.md` da raiz (contrato `{data}` / `{error}` vale aqui).

## Organização por módulo (feature)

- Cada recurso de negócio é um módulo isolado, com quatro papéis: **rotas**, **serviço**,
  **repositório** e **schema de validação**. Um módulo novo replica esse formato.
- Infra transversal (tratamento de erro, helpers) fica numa área compartilhada; módulos não
  importam uns dos outros — se dois módulos precisam do mesmo código, ele sobe para a área
  compartilhada.
- A aplicação é montada por uma função fábrica (sem `listen` dentro), para permitir teste sem
  porta fixa. Cada módulo exporta uma fábrica de router com o serviço injetável.

## Responsabilidade de cada camada

- **Rotas**: só traduzem HTTP. Validam entrada com o schema, chamam o serviço, devolvem
  `{ data }` com o status certo (`201` em criação). Nenhuma regra de negócio aqui.
- **Serviço**: regras de negócio e decisões (unicidade, permissões, orquestração). Não conhece
  `req`/`res`. Falhas de negócio viram `AppError` com status e `code` estável.
- **Repositório**: único ponto que fala com a persistência. Interface pequena e assíncrona; o
  serviço não sabe qual banco existe por trás.
- **Schema**: toda entrada externa (body, query, params) é validada com zod **antes** de chegar
  ao serviço. Normalize (`trim`, defaults) no schema, não espalhado pelo código.

## Erros

- Lance `AppError(status, code, message, details?)`; nunca responda erro manualmente na rota.
- Um único handler global converte erros no envelope `{ error }`. Erros de validação saem como
  `400 validation_error` com `details` por campo; conflito de negócio é `409`; inexistente é `404`.
- Erro inesperado → `500 internal_error` sem vazar stack ou mensagem interna.
- Handlers assíncronos passam por um wrapper que encaminha rejeições ao handler global.

## Convenções de API

- REST: coleção no plural (`GET /recurso`, `POST /recurso`), item em `/recurso/:id`.
- Listagens aceitam filtros por query string, validados por schema (todos opcionais).
- Nunca devolva campos internos; o formato de resposta é o contrato com o sdk.
- Alterou formato de resposta/entrada → sinalize que o sdk e o dashboard precisam acompanhar.

## Testes

- Teste de integração por módulo, subindo a app em porta efêmera e chamando HTTP de verdade.
- Cubra sempre: caminho feliz, entrada inválida (envelope de erro com `details`) e cada
  conflito/regra de negócio.
- Cada teste parte de estado limpo (app e repositório novos).
