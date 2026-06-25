import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "../src/settings.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("carrega configuracoes padrao quando nao ha dados salvos", () => {
  assert.deepEqual(loadSettings(memoryStorage()), DEFAULT_SETTINGS);
});

test("salva somente configuracoes reconhecidas e numericas validas", () => {
  const storage = memoryStorage();
  const saved = saveSettings(storage, {
    companyName: "Solaire Energia",
    responsibleName: "Matheus Ramos",
    pricePerWp: "3.75",
    performanceRatio: "0.81",
    moduleWarrantyYears: "30",
    inverterWarrantyYears: "10",
    ignored: "nao deve persistir",
  });

  assert.equal(saved.companyName, "Solaire Energia");
  assert.equal(saved.pricePerWp, 3.75);
  assert.equal(saved.performanceRatio, 0.81);
  assert.equal(saved.moduleWarrantyYears, 30);
  assert.equal(saved.inverterWarrantyYears, 10);
  assert.equal("ignored" in saved, false);
  assert.deepEqual(loadSettings(storage), saved);
});
