const MONTHS = "JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ";
const MONTH_LIST = MONTHS.split("|");

function fold(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00a0/g, " ");
}

function parseBrazilianNumber(value) {
  const clean = String(value ?? "").replace(/[^\d,.-]/g, "");
  if (!clean) return null;
  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : clean;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstNumber(text, expression) {
  const match = text.match(expression);
  return match ? parseBrazilianNumber(match[1]) : null;
}

function findCustomerBlock(lines) {
  for (let index = 1; index < lines.length - 2; index += 1) {
    const street = fold(lines[index]).toUpperCase();
    const previous = lines[index - 1].trim();
    const previousFolded = fold(previous).toUpperCase();
    if (!/^(R |RUA |AV |AVENIDA |ESTRADA |RODOVIA )/.test(street)) continue;
    if (/RGE|DISTRIBUIDORA|ENERGIA S\.A/.test(previousFolded)) continue;
    if (/SAO BORJA,?\s*2801/.test(street)) continue;

    const following = lines.slice(index + 1, index + 4);
    const postalIndex = following.findIndex((line) => /\d{5}-?\d{3}\s+.+\s+[A-Z]{2}$/i.test(fold(line)));
    if (postalIndex === -1) continue;

    const postalLine = following[postalIndex].trim();
    const locationMatch = fold(postalLine).match(/\d{5}-?\d{3}\s+(.+?)\s+([A-Z]{2})$/i);
    const neighborhood = postalIndex > 0 ? following[0].trim() : "";
    return {
      customerName: previous,
      address: [lines[index].trim(), neighborhood, postalLine].filter(Boolean).join(", "),
      city: locationMatch?.[1]?.trim() ?? "",
      state: locationMatch?.[2]?.toUpperCase() ?? "",
    };
  }

  return { customerName: "", address: "", city: "", state: "" };
}

function extractHistory(lines, compact) {
  const history = [];
  const pattern = new RegExp(`^(${MONTHS})\\s+(\\d{2,4})\\s+(\\d{1,5})\\s+(?:\\d{1,2})$`, "i");

  for (const line of lines) {
    const compact = fold(line).replace(/l{3,}/gi, " ").replace(/\s+/g, " ").trim();
    const match = compact.match(pattern);
    if (!match) continue;
    history.push({
      month: match[1].toUpperCase(),
      year: Number(match[2].length === 2 ? `20${match[2]}` : match[2]),
      kwh: Number(match[3]),
    });
    if (history.length === 12) break;
  }

  const markerIndex = lines.findIndex((line) => /Consumo faturado/i.test(fold(line)));
  if (markerIndex === -1) return history;

  const fallbackValues = [];
  for (const line of lines.slice(markerIndex + 1)) {
    if (/Total consolidado/i.test(fold(line))) break;
    const numbers = (line.match(/\d+(?:[.,]\d+)?/g) ?? []).map(parseBrazilianNumber);
    if (numbers.length < 2) continue;
    const days = numbers.at(-1);
    const kwh = numbers.at(-2);
    if (days >= 20 && days <= 35 && kwh >= 50 && kwh <= 9999) fallbackValues.push(kwh);
    if (fallbackValues.length === 12) break;
  }

  if (fallbackValues.length <= history.length) return history;
  const reference = compact.match(new RegExp(`(${MONTHS})\\/(\\d{4})`, "i"));
  const referenceMonth = Math.max(0, MONTH_LIST.indexOf(reference?.[1]?.toUpperCase()));
  const referenceYear = Number(reference?.[2] ?? new Date().getFullYear());
  return fallbackValues.map((kwh, index) => {
    const date = new Date(referenceYear, referenceMonth - index, 1);
    return { month: MONTH_LIST[date.getMonth()], year: date.getFullYear(), kwh };
  });
}

export function parseElectricBill(rawText) {
  const text = fold(rawText).replace(/\r/g, "");
  const lines = text.split("\n").map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  const compact = lines.join("\n");
  const customer = findCustomerBlock(lines);
  const supplyMatch = compact.match(/Tipo de Fornecimento\s*:\s*([A-Za-z]+)/i);
  const billTotal = firstNumber(compact, new RegExp(`(?:${MONTHS})\\/\\d{4}[^\\n]*?R\\$\\s*([\\d.,]+)`, "i"));
  const currentConsumptionKwh = firstNumber(
    compact,
    /Consumo Uso Sistema[^\n]*?kWh\s+([\d.,]+)/i,
  ) ?? firstNumber(compact, /Consumo faturado[^\n]*?([\d.,]+)\s*(?:kWh)?/i);
  const energySubtotal = firstNumber(compact, /Total Distribuidora\s+([\d.,]+)/i);
  const publicLighting = firstNumber(compact, /(?:Contribuicao|Custeio)[^\n]*?(?:IP-CIP|CIP)\s+(?:[A-Z]{3}\/\d{2})?\s*([\d.]+,\d{2})/i);
  const history = extractHistory(lines, compact);
  const warnings = [];

  if (!customer.customerName) warnings.push("Nao foi possivel identificar o cliente.");
  if (!customer.address) warnings.push("Nao foi possivel identificar o endereco.");
  if (!currentConsumptionKwh) warnings.push("Nao foi possivel identificar o consumo atual.");
  if (!history.length) warnings.push("Nao foi possivel identificar o historico de consumo.");
  if (!energySubtotal) warnings.push("Nao foi possivel identificar o subtotal de energia.");

  return {
    ...customer,
    distributor: /RGE SUL/i.test(compact) ? "RGE SUL" : "",
    supplyType: supplyMatch?.[1] ?? "",
    billTotal,
    currentConsumptionKwh,
    energySubtotal,
    publicLighting,
    effectiveEnergyTariff: energySubtotal && currentConsumptionKwh
      ? energySubtotal / currentConsumptionKwh
      : null,
    history,
    warnings,
  };
}
