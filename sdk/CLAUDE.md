# CLAUDE.md — sdk/

Cliente da API. É a **única** camada do front que conhece URLs, métodos HTTP e o envelope de
resposta. Complementa o `CLAUDE.md` da raiz.

## Princípios

- Espelha a api: um grupo de funções por módulo/recurso da api, com os mesmos nomes de recurso.
  Novo módulo na api → novo grupo aqui.
- Uma função por operação (`list`, `create`, `get`, `update`, `remove`), nomeadas pelo verbo de
  negócio, não pelo verbo HTTP.
- O sdk **desembrulha** `{ data }` e devolve só o payload. Em falha, lança sempre o mesmo tipo de
  erro, carregando `status`, `code`, `message` e `details` copiados do envelope `{ error }`.
- Erro de rede ou resposta sem corpo válido também vira esse tipo de erro, com um `code` estável
  (`unknown_error`), para o consumidor tratar um só caminho.

## Tipos

- Cada recurso tem um typedef JSDoc que reflete exatamente o payload da api (mesmos nomes,
  mesma caixa, datas como string ISO). Mudou o payload na api → mude o typedef no mesmo trabalho.
- Parâmetros de entrada aceitam só o que a api valida; não invente campos "por conveniência".

## Limites

- Sem dependência de framework de UI nem de estado global. Só `fetch` e utilitários.
- Sem regra de negócio e sem validação duplicada: quem valida é a api; o sdk repassa e traduz o
  erro.
- Configuração (URL base) entra por parâmetro na criação do cliente, nunca hardcoded.
- Query strings: ignore parâmetros vazios/nulos em vez de enviá-los.
