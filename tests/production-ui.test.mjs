import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("inclui favicon e autoria oficial", async () => {
  const [html, favicon] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../favicon.svg", import.meta.url), "utf8"),
  ]);

  assert.match(html, /rel="icon"[^>]+favicon\.svg/);
  assert.match(html, /Desenvolvido por\s*<strong>Matheus Ramos<\/strong>\s*-\s*<a[^>]+>51989849699<\/a>/);
  assert.match(html, /id="proposal-stage"/);
  assert.match(favicon, /<svg/);
  assert.match(favicon, /#cf6b38/i);
});

test("inclui seis paginas no modelo visual da proposta de referencia", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.equal((html.match(/<article class="proposal-page/g) || []).length, 6);
  assert.match(html, /alt="Proposta comercial energia solar"/);
  assert.match(html, /FUNCIONAMENTO DO\s+SISTEMA FOTOVOLTAICO ON-GRID/);
  assert.match(html, /SEU SISTEMA/);
  assert.match(html, /Garantia dos módulos/);
  assert.match(html, /Garantia do inversor/);
  assert.match(html, /id="roof-photo"/);
  assert.match(html, /Foto do telhado do cliente/);
  assert.match(html, /Investimento que se Paga/);
  assert.match(html, /PROPOSTA DE INVESTIMENTO/);
  assert.match(html, /PROPOSTA PRONTA/);
  assert.match(html, /src="\.\/foto2\.png"/);
  assert.match(html, /class="cover-client-reference"/);
  assert.match(html, /src="\.\/hv-logo\.png"/);
  assert.match(html, /class="reference-logo"/);
  assert.match(html, /src="\.\/FOTO1\.png"/);
  assert.match(html, /id="on-grid-diagram"/);
  assert.match(html, /id="system-comparison-chart"/);
  assert.match(html, /class="roof-photo-frame"/);
  assert.match(html, /id="roof-photo-image"/);
  assert.match(html, /id="roof-photo-placeholder"/);
  assert.match(html, /id="investment-curve"/);
  assert.match(html, /id="financial-projection-body"/);
  assert.match(html, /id="ten-year-savings"/);
  assert.match(html, /5% ao ano/);
  assert.match(html, /0,5% ao ano/);
  assert.match(html, /Página 6 de 6/);
});

test("renderiza payback com linha imediata e grafico comparativo", async () => {
  const app = await readFile(new URL("../src/app.js", import.meta.url), "utf8");

  assert.match(app, /roofPhotoDataUrl/);
  assert.match(app, /function renderRoofPhoto/);
  assert.match(app, /function renderFinancialProjection/);
  assert.match(app, /financialProjection\.rows/);
  assert.match(app, /Imediato/);
  assert.match(app, /is-payback-year/);
  assert.match(app, /ten-year-savings/);
  assert.match(app, /system-comparison-chart/);
  assert.match(app, /formatCurrency/);
});
