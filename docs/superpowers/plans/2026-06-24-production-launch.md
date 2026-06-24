# Proposta Solar Production Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o Proposta Solar responsivo, identificado e publicado no GitHub e Cloudflare Pages.

**Architecture:** A aplicacao estatica existente permanece modular. Um calculo puro controla a escala da previa A4, um build Node copia somente ativos publicos para `dist/`, e o Cloudflare Pages recebe esse diretorio na branch `main`.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Node test runner, Git, GitHub e Cloudflare Wrangler.

---

### Task 1: Responsividade e identidade

**Files:** `tests/layout.test.mjs`, `src/layout.js`, `src/app.js`, `index.html`, `styles.css`, `favicon.svg`

- [ ] Criar teste para escala da previa em larguras desktop e mobile.
- [ ] Executar `node --test tests/layout.test.mjs` e confirmar falha por modulo ausente.
- [ ] Implementar `calculatePreviewScale`, estagio redimensionavel, rodape, favicon e regras mobile.
- [ ] Executar o teste e confirmar sucesso.

### Task 2: Build publico

**Files:** `scripts/build.mjs`, `package.json`, `_headers`, `.gitignore`, `tests/build.test.mjs`

- [ ] Criar teste que executa o build e valida a lista de arquivos permitidos.
- [ ] Executar o teste e confirmar falha por script ausente.
- [ ] Implementar limpeza e copia deterministica para `dist/`.
- [ ] Executar `npm run build` e o teste de build.

### Task 3: Validacao local

**Files:** todos os arquivos alterados

- [ ] Executar `npm test` e `npm run build`.
- [ ] Servir `dist/` e validar desktop e viewport de 390 px.
- [ ] Confirmar favicon, credito, ausencia de overflow e previa escalada.

### Task 4: GitHub

**Files:** repositorio Git local

- [ ] Inicializar Git em `main`, revisar escopo e criar commit `publish Proposta Solar`.
- [ ] Criar ou reutilizar `proposta-solar` na conta conectada.
- [ ] Enviar `main` e verificar o commit remoto.

### Task 5: Cloudflare Pages

**Files:** `dist/`

- [ ] Criar ou reutilizar o projeto `proposta-solar`.
- [ ] Executar `npx wrangler pages deploy dist --project-name proposta-solar --branch main`.
- [ ] Listar deployments e confirmar producao em `main`.
- [ ] Abrir a URL publica e repetir as verificacoes essenciais.

## Self-review

O plano cobre responsividade, identificacao, favicon, empacotamento e os dois destinos de publicacao. Nao ha marcadores pendentes ou nomes inconsistentes.
