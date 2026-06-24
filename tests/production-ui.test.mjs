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

test("inclui cinco paginas com funcionamento on-grid e projecao financeira", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.equal((html.match(/<article class="proposal-page/g) || []).length, 5);
  assert.match(html, /Como funciona o sistema on-grid/);
  assert.match(html, /id="on-grid-diagram"/);
  assert.match(html, /Projeção financeira de 20 anos/);
  assert.match(html, /id="financial-projection-body"/);
  assert.match(html, /id="projection-total-savings"/);
  assert.match(html, /5% ao ano/);
  assert.match(html, /0,5% ao ano/);
  assert.match(html, /Página 5 de 5/);
});
