import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("oferece inicializador local de um clique", async () => {
  const batch = await readFile(new URL("../ABRIR-APP.bat", import.meta.url), "utf8");
  const launcher = await readFile(new URL("../scripts/start-app.ps1", import.meta.url), "utf8");

  assert.match(batch, /scripts\\start-app\.ps1/i);
  assert.match(launcher, /http\.server/);
  assert.match(launcher, /127\.0\.0\.1/);
  assert.match(launcher, /Start-Process/);
});

test("avisa quando index e aberto diretamente por file", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /id="local-file-warning"/);
  assert.match(html, /location\.protocol\s*===\s*["']file:["']/);
  assert.match(html, /ABRIR-APP\.bat/);
});
