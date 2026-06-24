import test from "node:test";
import assert from "node:assert/strict";

import {
  availabilityForSupply,
  calculateAverageConsumption,
  calculateSystem,
} from "../src/solar-calculator.js";

const rgeHistory = [522, 801, 795, 1132, 743, 834, 614, 519, 487, 484, 620, 574, 401];

test("calcula a media usando no maximo os 12 meses mais recentes", () => {
  assert.equal(calculateAverageConsumption(rgeHistory), 677.0833333333334);
});

test("retorna a disponibilidade correta pelo tipo de fornecimento", () => {
  assert.equal(availabilityForSupply("Monofásico"), 30);
  assert.equal(availabilityForSupply("BIFASICO"), 50);
  assert.equal(availabilityForSupply("trifásico"), 100);
});

test("dimensiona modulos, geracao, investimento, economia e payback", () => {
  const result = calculateSystem({
    monthlyConsumption: calculateAverageConsumption(rgeHistory),
    supplyType: "Monofásico",
    irradiation: 4.5,
    performanceRatio: 0.8,
    modulePowerWp: 550,
    pricePerWp: 3.5,
    effectiveTariff: 554.75 / 522,
  });

  assert.equal(result.availabilityKwh, 30);
  assert.equal(result.moduleCount, 11);
  assert.equal(result.installedPowerKwp, 6.05);
  assert.equal(result.monthlyGenerationKwh, 653.4);
  assert.equal(result.investment, 21175);
  assert.ok(result.monthlySavings > 687 && result.monthlySavings < 689);
  assert.ok(result.paybackYears > 2.5 && result.paybackYears < 2.7);
});

test("rejeita entradas tecnicas invalidas", () => {
  assert.throws(
    () => calculateSystem({
      monthlyConsumption: 500,
      supplyType: "monofasico",
      irradiation: 0,
      performanceRatio: 0.8,
      modulePowerWp: 550,
      pricePerWp: 3.5,
      effectiveTariff: 1,
    }),
    /irradiacao/i,
  );
});
