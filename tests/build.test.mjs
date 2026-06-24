import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import test from "node:test";

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(`${directory}/${entry.name}`, relative));
    else files.push(relative);
  }
  return files.sort();
}

test("gera um pacote de producao enxuto e completo", async () => {
  execFileSync(process.execPath, ["scripts/build.mjs"], { stdio: "pipe" });
  const files = await listFiles("dist");

  assert.deepEqual(files, [
    "_headers",
    "data/solar-brazil.json",
    "favicon.svg",
    "index.html",
    "src/app.js",
    "src/bill-parser.js",
    "src/document-reader.js",
    "src/financial-projection.js",
    "src/irradiation.js",
    "src/layout.js",
    "src/proposal.js",
    "src/settings.js",
    "src/solar-calculator.js",
    "styles.css",
  ]);
});
