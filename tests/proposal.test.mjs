import test from "node:test";
import assert from "node:assert/strict";

import { createProposalModel } from "../src/proposal.js";

test("cria modelo de proposta sem copiar identificadores sensiveis", () => {
  const model = createProposalModel({
    bill: {
      customerName: "CLIENTE TESTE",
      address: "R EXEMPLO 26, CENTRO, SAPUCAIA DO SUL RS",
      city: "SAPUCAIA DO SUL",
      state: "RS",
      billTotal: 624.54,
      currentConsumptionKwh: 522,
      publicLighting: 69.79,
      cpf: "000.000.000-00",
    },
    system: {
      monthlyConsumption: 677.08,
      moduleCount: 11,
      modulePowerWp: 550,
      installedPowerKwp: 6.05,
      monthlyGenerationKwh: 653.4,
      annualGenerationKwh: 7840.8,
      investment: 21175,
      monthlySavings: 687.5,
      annualSavings: 8250,
      paybackYears: 2.57,
    },
    settings: { companyName: "Solaire Energia", responsibleName: "Matheus", phone: "51999999999", email: "" },
    inverterModel: "Deye 6 kW",
    irradiation: { annual: 4.617, monthly: Array(12).fill(4.617) },
    issuedAt: new Date("2026-06-23T12:00:00-03:00"),
  });

  assert.equal(model.customerName, "CLIENTE TESTE");
  assert.equal(model.moduleDescription, "11 módulos de 550 Wp");
  assert.equal(model.inverterModel, "Deye 6 kW");
  assert.equal(model.monthlyProjection.length, 12);
  assert.equal(model.financialProjection.rows.length, 20);
  assert.equal(model.financialProjection.paybackYear, 3);
  assert.ok(model.financialProjection.totalSavings > model.annualSavings * 20);
  assert.equal(model.annualTariffEscalation, 0.05);
  assert.equal(model.annualGenerationDegradation, 0.005);
  assert.equal(model.referenceLifetimeYears, 25);
  assert.equal("cpf" in model, false);
  assert.equal("publicLighting" in model, false);
});
