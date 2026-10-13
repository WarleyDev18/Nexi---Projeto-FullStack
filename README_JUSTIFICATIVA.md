# README_JUSTIFICATIVA

O repositório de origem estava vazio, então montei um exemplo full-stack pequeno, mas funcional
(3 testes de API passando, build do dashboard fechando), já organizado como monorepo:

```
/
├── CLAUDE.md            ← visão geral + contrato entre os lados + regras gerais
├── api/CLAUDE.md        ← padrões do servidor
├── sdk/CLAUDE.md        ← padrões do cliente tipado da API
├── dashboard/CLAUDE.md  ← padrões da interface
└── docs/PLAN_MODE_TRANSCRICAO.md  ← prompt em plan mode + plano gerado
```

## 1. Por que dividi as regras assim

Um arquivo único gigante tem dois problemas: o agente carrega regras de back-end quando está
mexendo em React (ruído que dilui o que importa), e ninguém mantém um documento que mistura
tudo. Dividi em **três níveis de alcance**:

- **Raiz**: o que é verdade para qualquer pessoa/agente em qualquer pacote: o que o projeto é,
  como os pacotes se relacionam (`dashboard → sdk → api`), o **contrato** entre front e back
  (envelope `{data}`/`{error}`, `camelCase`, `code` estável) e a regra de trabalho "ache uma
  feature parecida e siga o padrão".
- **Por pacote**: o que só faz sentido dentro daquele módulo (camadas da api, regras do sdk,
  estados de interface do dashboard). O agente carrega esses arquivos quando entra na pasta.
- **sdk como pacote próprio**: criei o `sdk/` de propósito. Ele é a "dobradiça" entre os dois
  lados e ganha regras próprias: é a única camada que conhece URL e envelope. Sem ele, o
  dashboard acabaria repetindo `fetch` e tratamento de erro em cada tela.

## 2. Critérios para decidir o que vai em cada subarquivo

1. **Alcance**: se a regra vale para mais de um pacote, sobe para a raiz; se só vale para um,
   desce para ele.
2. **Quem sofre se a regra for violada**: contrato de dados quebra os dois lados, então fica na
   raiz. "Rota não tem regra de negócio" só quebra a api, então fica em `api/`.
3. **Padrão repetível, não fato isolado**: só entra o que o agente vai precisar aplicar de novo
   em código novo (como organizar um módulo, como tratar erro, quais estados a tela tem). Se é
   algo que ele descobre lendo o código em dois segundos, fica fora.
4. **Responsabilidade de cada camada**: descrevo o que cada camada faz e o que ela *não* faz.
   Os limites são o que mais evita código no lugar errado.

## 3. Por que (não) documentei nomes exatos de arquivos e estrutura

Evitei de propósito. Lista de arquivos envelhece: basta renomear ou mover uma pasta para o
documento passar a mentir, e um agente que confia nele procura algo que não existe ou, pior,
"corrige" o código para bater com o documento. O código atual já mostra a estrutura de verdade,
e o agente consegue lê-la na hora.

Por isso as regras falam em **papéis** ("rotas, serviço, repositório, schema"), **formatos**
(`{ data }`, `AppError` com `code` estável) e **direções de dependência** (componente não chama
`fetch`). Isso continua verdadeiro mesmo se os arquivos mudarem de lugar. A única "âncora" que
nomeio é conceitual: "a feature de projetos é a referência". É uma indicação de onde olhar,
não um caminho fixo.

Exceção consciente: a raiz cita os comandos de `npm`, porque são interface estável e o agente
precisa executá-los literalmente.

## 4. Como isso ajuda numa feature que mexe em back-end e front-end

O risco típico de uma feature fullstack é cada lado sair certo isoladamente e errado em conjunto:
um campo com outro nome, um código de erro que o front não trata, um enum com valor diferente.
A divisão ataca isso em três pontos:

- **O contrato mora num lugar só (raiz)** e os três pacotes o herdam. Api, sdk e dashboard
  falam o mesmo formato porque todos leram a mesma regra.
- **A ordem de trabalho é imposta**: contrato → api → sdk → dashboard. O dashboard só consome o
  que o sdk já expõe, e o sdk só espelha o que a api já validou. Cada passo tem um "vizinho" que
  confere o anterior.
- **Cada subarquivo aponta para o vizinho**: o da api diz "mudou o formato de resposta, sinalize
  sdk e dashboard"; o do dashboard diz "confirme no sdk antes de consumir". O agente é lembrado
  do outro lado justamente na hora em que poderia esquecê-lo.

## 5. Prova: plan mode planejando uma feature nova

Pedi a um agente em plan mode (somente leitura) para planejar a feature **tarefas por
projeto**, usando **projetos** como referência. Prompt e plano completo em
[`docs/PLAN_MODE_TRANSCRICAO.md`](docs/PLAN_MODE_TRANSCRICAO.md).

O que mostra que ele enxergou os dois lados:

- Citou arquivos reais da api (rotas, schema, serviço, repositório, teste), do sdk e do
  dashboard, tudo da feature de projetos.
- Montou o contrato no envelope do repositório e propôs os passos na ordem
  contrato → api → sdk → dashboard, ligando cada passo a uma regra dos `CLAUDE.md`.
- Pegou um conflito entre regras: o serviço de tarefas precisa saber se o projeto existe, mas
  "módulos não importam uns dos outros" (regra da api). Propôs injeção pela raiz de composição.
- Alertou sobre consistência: mesmos nomes e valores de `status` em schema, typedef do sdk e UI,
  e a corrida de resposta antiga ao trocar de projeto na tela.
- Apontou lacunas reais do código (não existe busca de projeto por id; sdk e dashboard não têm
  testes), em vez de supor que existiam.

Uma limitação honesta: a transcrição foi gerada por um subagente Plan do Claude Code
(somente leitura) e não por um print da interface do plan mode.
