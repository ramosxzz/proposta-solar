import test from "node:test";
import assert from "node:assert/strict";

import { findIrradiation, normalizePlace } from "../src/irradiation.js";

const records = {
  "SAPUCAIA DO SUL|RS": { annual: 4.617, monthly: [5.557, 5.545, 5.177, 4.672, 3.762, 3.304, 3.499, 4.095, 3.964, 4.633, 5.541, 5.662] },
};

test("normaliza cidade com acentos para busca deterministica", () => {
  assert.equal(normalizePlace("  São Leopoldo  "), "SAO LEOPOLDO");
});

test("encontra irradiacao municipal e mantem valores mensais", () => {
  const result = findIrradiation("Sapucaia do Sul", "RS", records);
  assert.equal(result.annual, 4.617);
  assert.equal(result.monthly.length, 12);
  assert.equal(result.fallback, false);
});

test("usa valor conservador e sinaliza fallback quando cidade nao existe", () => {
  const result = findIrradiation("Cidade Inexistente", "RS", records);
  assert.equal(result.annual, 4.5);
  assert.equal(result.fallback, true);
});
