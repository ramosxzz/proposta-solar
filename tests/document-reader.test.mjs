import test from "node:test";
import assert from "node:assert/strict";

import { groupTextItems } from "../src/document-reader.js";

test("reconstroi linhas do PDF pela posicao visual", () => {
  const text = groupTextItems([
    { str: "522", transform: [1, 0, 0, 1, 220, 500] },
    { str: "26", transform: [1, 0, 0, 1, 150, 500.2] },
    { str: "MAI", transform: [1, 0, 0, 1, 100, 500] },
    { str: "CLIENTE TESTE", transform: [1, 0, 0, 1, 80, 600] },
  ]);

  assert.equal(text, "CLIENTE TESTE\nMAI 26 522");
});
