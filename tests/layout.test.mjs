import test from "node:test";
import assert from "node:assert/strict";

import { calculatePreviewScale } from "../src/layout.js";

test("mantem a proposta em tamanho natural quando ha espaco", () => {
  assert.equal(calculatePreviewScale(1000), 1);
});

test("reduz a proposta para caber em um celular de 390 px", () => {
  const scale = calculatePreviewScale(390);
  assert.ok(scale > 0.45 && scale < 0.47);
  assert.ok(794 * scale <= 390 - 24);
});
