# Proposal Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expandir a proposta solar para cinco páginas com explicação on-grid e projeção financeira automática de 20 anos.

**Architecture:** Um novo módulo puro calculará a projeção financeira sem acessar o DOM. O modelo de proposta incorporará esse resultado, enquanto `app.js` ficará responsável apenas por preencher a tabela e os destaques; HTML e CSS definirão as duas páginas A4 adicionais e o diagrama vetorial.

**Tech Stack:** JavaScript ES modules, HTML/CSS, Node Test Runner, html2pdf.js, Cloudflare Pages.

---

### Task 1: Motor de projeção financeira

**Files:**
- Create: `src/financial-projection.js`
- Create: `tests/financial-projection.test.mjs`

- [ ] **Step 1: Escrever os testes que falham**

Testar uma projeção de três anos com `annualSavings = 1000`, `investment = 1800`, reajuste de 5% e degradação de 0,5%. A primeira linha deve ter economia de 1000 e saldo de -800; cada linha seguinte deve aplicar o fator composto `1.05 * 0.995`; o retorno deve ocorrer no segundo ano. Adicionar casos de retorno acima do horizonte e parâmetros negativos.

- [ ] **Step 2: Confirmar a falha**

Run: `node --test tests/financial-projection.test.mjs`

Expected: FAIL porque `src/financial-projection.js` ainda não existe.

- [ ] **Step 3: Implementar a função pura**

Criar:

```js
export function createFinancialProjection({
  annualSavings,
  investment,
  years = 20,
  annualTariffEscalation = 0.05,
  annualGenerationDegradation = 0.005,
})
```

A função validará números finitos e não negativos, gerará `rows` com `year`, `annualSavings`, `accumulatedSavings` e `balance`, e retornará também `paybackYear` e `totalSavings`.

- [ ] **Step 4: Confirmar os testes verdes**

Run: `node --test tests/financial-projection.test.mjs`

Expected: todos os testes do arquivo passam.

- [ ] **Step 5: Commit**

```bash
git add src/financial-projection.js tests/financial-projection.test.mjs
git commit -m "feat: add twenty-year financial projection"
```

### Task 2: Integrar a projeção ao modelo da proposta

**Files:**
- Modify: `src/proposal.js`
- Modify: `tests/proposal.test.mjs`

- [ ] **Step 1: Expandir o teste do modelo**

Exigir `financialProjection.rows.length === 20`, reajuste `0.05`, degradação `0.005`, economia total positiva e retorno identificado para o cenário atual.

- [ ] **Step 2: Confirmar a falha**

Run: `node --test tests/proposal.test.mjs`

Expected: FAIL porque `financialProjection` não existe no modelo.

- [ ] **Step 3: Integrar o motor**

Importar `createFinancialProjection`, calcular com `system.annualSavings` e `system.investment`, e expor no modelo:

```js
financialProjection,
annualTariffEscalation: 0.05,
annualGenerationDegradation: 0.005,
referenceLifetimeYears: 25,
```

- [ ] **Step 4: Executar os testes relacionados**

Run: `node --test tests/proposal.test.mjs tests/financial-projection.test.mjs`

Expected: todos passam.

- [ ] **Step 5: Commit**

```bash
git add src/proposal.js tests/proposal.test.mjs
git commit -m "feat: enrich proposal model with long-term returns"
```

### Task 3: Criar as páginas 4 e 5

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tests/production-ui.test.mjs`

- [ ] **Step 1: Testar a estrutura do documento**

Exigir cinco elementos `.proposal-page`, textos `Como funciona o sistema on-grid` e `Projeção financeira de 20 anos`, tabela `#financial-projection-body`, resumo de economia e notas com `5%` e `0,5%`.

- [ ] **Step 2: Confirmar a falha estrutural**

Run: `node --test tests/production-ui.test.mjs`

Expected: FAIL indicando que as duas páginas não existem.

- [ ] **Step 3: Implementar a página 4**

Adicionar três cards de benefícios, quatro etapas numeradas e diagrama SVG original com módulos, inversor, casa, medidor e rede. Usar os bindings `referenceLifetimeYears` e `paybackYears` e linguagem não garantidora para valorização.

- [ ] **Step 4: Implementar a página 5**

Adicionar investimento, data, economia acumulada, retorno projetado, tabela com 20 linhas geradas via JavaScript e notas técnicas das premissas.

- [ ] **Step 5: Atualizar o CSS A4**

Criar estilos isolados `.proposal-benefits`, `.on-grid-flow`, `.on-grid-diagram`, `.projection-summary`, `.projection-table` e `.projection-notes`, mantendo cada página em `794 × 1123 px` e a escala mobile existente.

- [ ] **Step 6: Atualizar rodapés**

Alterar os rodapés existentes para `Página 2 de 5`, `Página 3 de 5` e incluir `Página 4 de 5` e `Página 5 de 5`.

- [ ] **Step 7: Confirmar o teste estrutural**

Run: `node --test tests/production-ui.test.mjs`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add index.html styles.css tests/production-ui.test.mjs
git commit -m "feat: add on-grid and investment proposal pages"
```

### Task 4: Renderizar a tabela e os indicadores

**Files:**
- Modify: `src/app.js`
- Modify: `tests/production-ui.test.mjs`

- [ ] **Step 1: Adicionar contratos de renderização ao teste**

Exigir no código a criação de 20 linhas, classe `is-payback-year`, texto `Acima de 20 anos` no cenário sem retorno e formatação monetária via `formatCurrency`.

- [ ] **Step 2: Confirmar a falha**

Run: `node --test tests/production-ui.test.mjs`

Expected: FAIL porque o renderizador ainda não existe.

- [ ] **Step 3: Implementar `renderFinancialProjection`**

Limpar `#financial-projection-body`, criar cada linha com DOM seguro e quatro células, destacar o primeiro saldo positivo, preencher `#projection-total-savings` e `#projection-payback-year`, e chamar a função dentro de `renderProposal()`.

- [ ] **Step 4: Executar testes relacionados**

Run: `node --test tests/production-ui.test.mjs tests/proposal.test.mjs tests/financial-projection.test.mjs`

Expected: todos passam.

- [ ] **Step 5: Commit**

```bash
git add src/app.js tests/production-ui.test.mjs
git commit -m "feat: render long-term proposal projection"
```

### Task 5: Validar aplicação e PDF

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `src/app.js`

- [ ] **Step 1: Rodar a suíte completa e o build**

Run: `npm test && npm run build`

Expected: zero falhas e `dist/` com os módulos novos.

- [ ] **Step 2: Validar desktop e mobile**

Abrir o fixture local com cálculo automático, verificar cinco páginas, ausência de rolagem horizontal em 390 px e escala proporcional da prévia.

- [ ] **Step 3: Gerar e renderizar o PDF**

Baixar o PDF de teste pelo fluxo real, renderizar as cinco páginas em PNG e inspecionar cortes, legibilidade da tabela, rodapés, diagrama e consistência visual.

- [ ] **Step 4: Corrigir e repetir verificações**

Qualquer ajuste visual deve ser seguido por `npm test`, novo build e nova renderização do PDF.

- [ ] **Step 5: Commit final de ajustes**

```bash
git add index.html styles.css src/app.js
git commit -m "fix: polish five-page proposal layout"
```

### Task 6: Publicar a atualização

**Files:**
- No source changes expected.

- [ ] **Step 1: Verificar árvore e commits**

Run: `git status --short --branch && git log -5 --oneline`

Expected: árvore limpa na branch `main`.

- [ ] **Step 2: Enviar ao GitHub**

Run: `git push origin main`

Expected: `main` remoto atualizado.

- [ ] **Step 3: Publicar no Cloudflare Pages**

Run: `npx wrangler pages deploy dist --project-name proposta-solar --branch main`

Expected: deploy concluído.

- [ ] **Step 4: Verificar produção**

Run: `npx wrangler pages deployment list --project-name proposta-solar`

Expected: commit atual em `Production`, branch `main`, e `https://proposta-solar-f26.pages.dev/` respondendo HTTP 200.
