# CLAUDE.md — dashboard/

Padrões da interface web (React + Vite). Complementa o `CLAUDE.md` da raiz.

## Organização por feature

- Código agrupado por funcionalidade, não por tipo técnico. Cada feature reúne sua página, seus
  componentes e seu hook de dados. Uma feature nova replica esse formato.
- Código realmente compartilhado (instância do cliente, utilitários) fica numa área comum;
  features não importam internals umas das outras.

## Dados e rede

- Componentes **nunca** chamam `fetch` nem montam URL. Todo acesso a dados passa pelo sdk, usando
  a instância única do cliente.
- Cada feature expõe um hook que encapsula carregar/criar/atualizar e devolve um estado explícito:
  `status` (`loading` | `ready` | `error`), os dados e as ações. A página só consome o hook.
- Após uma mutação, recarregue a coleção afetada em vez de editar o estado local à mão.
- Decida comportamento pelo `code` do erro do sdk; use `details` para mensagens por campo e
  `message` como fallback.

## Estados de interface (obrigatórios em toda tela com dados)

- Carregando, vazio, erro e sucesso são tratados explicitamente. Nunca deixe tela em branco.
- Formulários: mostram erro de validação junto ao campo vindo de `details`; limpam o campo e o
  erro após sucesso; evitam duplo envio enquanto a requisição está em andamento.
- Erros do usuário em português, curtos e acionáveis.

## Estilo de código

- Componentes funcionais com hooks; um componente exportado por arquivo de página.
- Estado local para estado de UI; estado do servidor fica no hook da feature.
- Sem estilos hardcoded espalhados quando houver sistema de estilo; reutilize o existente.
- Configuração por variável de ambiente do bundler, nunca URL fixa no código.

## Consistência com a api

- Os nomes de campos usados na UI são exatamente os do payload (`camelCase`); não renomeie na
  borda — se precisar de outro formato, transforme dentro do hook.
- Ao consumir um endpoint novo, confirme no sdk se a função e o tipo já existem; se não, crie-os
  lá primeiro (veja o `CLAUDE.md` do sdk) e só então use na feature.
