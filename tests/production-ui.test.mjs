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
