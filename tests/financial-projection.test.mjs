import assert from "node:assert/strict";
import test from "node:test";

import { createFinancialProjection } from "../src/financial-projection.js";

test("projeta economia, acumulado e saldo com reajuste e degradacao", () => {
  const projection = createFinancialProjection({
    annualSavings: 1000,
    investment: 1800,
    years: 3,
    annualTariffEscalation: 0.05,
    annualGenerationDegradation: 0.005,
  });

  assert.equal(projection.rows.length, 3);
  assert.deepEqual(projection.rows[0], {
    year: 1,
    annualSavings: 1000,
    accumulatedSavings: 1000,
    balance: -800,
  });
  assert.ok(Math.abs(projection.rows[1].annualSavings - 1044.75) < 0.001);
  assert.ok(Math.abs(projection.rows[1].accumulatedSavings - 2044.75) < 0.001);
  assert.ok(Math.abs(projection.rows[1].balance - 244.75) < 0.001);
  assert.equal(projection.paybackYear, 2);
  assert.equal(projection.totalSavings, projection.rows[2].accumulatedSavings);
});

test("informa quando o investimento nao retorna dentro do horizonte", () => {
  const projection = createFinancialProjection({
    annualSavings: 100,
    investment: 10000,
    years: 20,
  });

  assert.equal(projection.paybackYear, null);
  assert.ok(projection.rows.every((row) => row.balance < 0));
});

test("rejeita valores financeiros e premissas invalidas", () => {
  assert.throws(() => createFinancialProjection({ annualSavings: -1, investment: 1000 }), /economia anual/i);
  assert.throws(() => createFinancialProjection({ annualSavings: 1000, investment: Number.NaN }), /investimento/i);
  assert.throws(() => createFinancialProjection({ annualSavings: 1000, investment: 1000, years: 0 }), /anos/i);
  assert.throws(() => createFinancialProjection({ annualSavings: 1000, investment: 1000, annualGenerationDegradation: 1 }), /degradação/i);
});
