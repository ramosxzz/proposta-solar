# Reference Proposal PDF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current proposal document with a six-page layout modeled on the supplied reference PDF, including module and inverter warranties.

**Architecture:** Keep the static app architecture. Add warranty fields to settings/review data, enrich `createProposalModel`, replace the proposal HTML pages, update rendering functions for the comparison and payback tables, and restyle the A4 pages in `styles.css`.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript modules, Node test runner, html2canvas, jsPDF.

---

### Task 1: Failing tests for the reference proposal

**Files:**
- Modify: `tests/production-ui.test.mjs`
- Modify: `tests/proposal.test.mjs`
- Modify: `tests/settings.test.mjs`

- [x] Add assertions for six proposal pages, reference titles, warranty fields and immediate payback row.
- [x] Run `npm test` and verify the new assertions fail before implementation.

### Task 2: Data model and form inputs

**Files:**
- Modify: `src/settings.js`
- Modify: `src/proposal.js`
- Modify: `src/app.js`
- Modify: `index.html`

- [ ] Add default warranty settings and review form inputs.
- [ ] Pass warranty values into `createProposalModel`.
- [ ] Add 10-year accumulated savings and solar coverage percent to the model.

### Task 3: Six-page reference document

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `src/app.js`

- [ ] Replace the five-page proposal markup with six reference-style pages.
- [ ] Add self-contained SVG/CSS illustrations for cover waves, on-grid diagram, payback curve and closing trophy.
- [ ] Render comparison chart and payback table in the new containers.

### Task 4: Verification

**Files:**
- Modify as needed from failures only.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Generate and inspect a PDF from the fixture in a local browser.
- [ ] Confirm mobile preview has no horizontal overflow.
