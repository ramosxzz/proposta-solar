# Gerador Automatico de Proposta Solar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma aplicacao web que leia a conta de energia, dimensione o sistema e gere uma proposta solar profissional.

**Architecture:** Aplicacao estatica modular, com processamento local do PDF/OCR, parser determinista e motor de calculo puro. Configuracoes persistem no navegador; arquivos enviados nao sao armazenados.

**Tech Stack:** HTML5, CSS, JavaScript ES modules, PDF.js, Tesseract.js, html2pdf.js, Node test runner.

---

### Task 1: Base testavel e motor de calculo

**Files:** `package.json`, `src/solar-calculator.js`, `tests/solar-calculator.test.mjs`

- [ ] Criar testes para media de 12 meses, disponibilidade por fase, potencia, modulos, geracao, investimento, economia e payback.
- [ ] Executar `npm test` e confirmar falha inicial por modulo ausente.
- [ ] Implementar funcoes puras com validacao numerica e arredondamento somente na apresentacao.
- [ ] Executar `npm test` e confirmar todos os testes verdes.

### Task 2: Leitor estruturado da conta

**Files:** `src/bill-parser.js`, `tests/bill-parser.test.mjs`, `tests/fixtures/rge-sample.txt`

- [ ] Criar fixture anonimizada baseada na conta RGE fornecida.
- [ ] Testar cliente, endereco, fornecimento, total, consumo, tarifa, CIP e 12 meses.
- [ ] Implementar normalizacao de texto e parser RGE/CPFL com avisos por campo ausente.
- [ ] Executar `npm test` e confirmar a leitura esperada.

### Task 3: Interface e configuracoes

**Files:** `index.html`, `styles.css`, `src/settings.js`, `src/app.js`

- [ ] Reconstruir o HTML invalido como fluxo em quatro etapas e dialogo de configuracoes.
- [ ] Criar layout responsivo, acessivel e adequado a desktop e celular.
- [ ] Persistir empresa, contato, preco por Wp, PR e logotipo em `localStorage`.
- [ ] Validar campos obrigatorios antes do dimensionamento.

### Task 4: PDF, OCR e base solar

**Files:** `src/document-reader.js`, `src/irradiation.js`, `data/solar-rs.json`, `src/app.js`

- [ ] Extrair texto com PDF.js.
- [ ] Quando nao houver texto suficiente, renderizar a primeira pagina e executar OCR com Tesseract.js.
- [ ] Consultar a irradiacao municipal incorporada e usar fallback explicito de 4,5 h/dia.
- [ ] Exibir progresso e permitir correcao de qualquer campo.

### Task 5: Proposta e PDF

**Files:** `src/proposal.js`, `src/app.js`, `styles.css`

- [ ] Montar previa com cliente, consumo, dimensionamento, geracao, economia, investimento, payback, equipamentos e dados do integrador.
- [ ] Excluir identificadores sensiveis e itens que nao geram economia.
- [ ] Gerar PDF A4 com duas paginas e nome de arquivo deterministico.
- [ ] Incluir aviso de estimativa e validade comercial.

### Task 6: Verificacao final

**Files:** todos os arquivos criados

- [ ] Executar `npm test`.
- [ ] Servir a aplicacao localmente e processar `luz casa (1).pdf`.
- [ ] Conferir que a media fica perto de 677 kWh/mes e que 12 meses sao usados.
- [ ] Gerar o PDF e inspecionar visualmente todas as paginas.
- [ ] Corrigir erros de console, cortes, sobreposicoes e campos vazios.

## Self-review

O plano cobre todas as exigencias da especificacao. Nao ha marcadores pendentes, e os nomes dos modulos sao consistentes entre tarefas.
