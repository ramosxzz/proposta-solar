import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { parseElectricBill } from "../src/bill-parser.js";

const sample = await readFile(new URL("./fixtures/rge-sample.txt", import.meta.url), "utf8");

test("extrai identificacao e endereco da conta RGE", () => {
  const bill = parseElectricBill(sample);
  assert.equal(bill.customerName, "CLIENTE TESTE DA SILVA");
  assert.equal(bill.address, "R EXEMPLO 26, CENTRO, 93230-455 SAPUCAIA DO SUL RS");
  assert.equal(bill.city, "SAPUCAIA DO SUL");
  assert.equal(bill.state, "RS");
  assert.equal(bill.distributor, "RGE SUL");
  assert.equal(bill.supplyType, "Monofasico");
});

test("extrai valores de energia sem misturar iluminacao publica", () => {
  const bill = parseElectricBill(sample);
  assert.equal(bill.billTotal, 624.54);
  assert.equal(bill.currentConsumptionKwh, 522);
  assert.equal(bill.energySubtotal, 554.75);
  assert.equal(bill.publicLighting, 69.79);
  assert.equal(bill.effectiveEnergyTariff, 554.75 / 522);
});

test("extrai os 12 consumos mais recentes em ordem", () => {
  const bill = parseElectricBill(sample);
  assert.equal(bill.history.length, 12);
  assert.deepEqual(bill.history.map((item) => item.kwh), [522, 801, 795, 1132, 743, 834, 614, 519, 487, 484, 620, 574]);
});

test("informa campos essenciais ausentes", () => {
  const bill = parseElectricBill("RGE SUL DISTRIBUIDORA DE ENERGIA");
  assert.ok(bill.warnings.some((warning) => warning.includes("consumo")));
  assert.ok(bill.warnings.some((warning) => warning.includes("endereco")));
});

test("recupera historico e CIP quando o OCR mistura rotulos do grafico", () => {
  const ocrText = `
RGE SUL DISTRIBUIDORA DE ENERGIA S.A.
CLIENTE TESTE DA SILVA
R EXEMPLO 26
CENTRO
93230-455 SAPUCAIA DO SUL RS
MAI/2026 03/06/2026 R$ 624,54
Tipo de Fornecimento: Monofasico
Consumo Uso Sistema [KWh]-TUSD MAI/26 kWh 522,0000 0,51775000
Total Distribuidora 554,75
Consumo faturado Nº dias
Contribuição Custeio IP-CIP MAI/26 69,79 ma WWW 522 29
ABR26 EM 801 30
MAR26 EM 795 28
FEv2s OA 1132 32
JaN26 IE 743 30
DEz2s HH 834 29
Nov2s EM 614 32
outras WMM 519 31
seres MW 487 32
Aco2s MW 484 30
JuLzs = 620 29
Junzs = 574 32
mai2s Hl 401 29
Total consolidado 624,54
`;
  const bill = parseElectricBill(ocrText);
  assert.equal(bill.publicLighting, 69.79);
  assert.deepEqual(bill.history.map((item) => item.kwh), [522, 801, 795, 1132, 743, 834, 614, 519, 487, 484, 620, 574]);
});
