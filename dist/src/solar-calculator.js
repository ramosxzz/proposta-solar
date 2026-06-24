function requirePositive(value, label) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} deve ser maior que zero.`);
  }
  return parsed;
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function calculateAverageConsumption(history, maxMonths = 12) {
  const values = (Array.isArray(history) ? history : [])
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0)
    .slice(0, maxMonths);

  if (!values.length) {
    throw new Error("O historico precisa ter pelo menos um consumo valido.");
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function availabilityForSupply(supplyType) {
  const normalized = normalizeText(supplyType);
  if (normalized.includes("tri")) return 100;
  if (normalized.includes("bi")) return 50;
  return 30;
}

const PRICE_CURVE = [
  { maxKwp: 3, pricePerWp: 5.20 },
  { maxKwp: 5, pricePerWp: 4.50 },
  { maxKwp: 8, pricePerWp: 3.90 },
  { maxKwp: 12, pricePerWp: 3.50 },
  { maxKwp: 20, pricePerWp: 3.10 },
  { maxKwp: 40, pricePerWp: 2.80 },
  { maxKwp: Infinity, pricePerWp: 2.50 },
];

export function getPricePerWp(systemSizeKwp) {
  const size = Number(systemSizeKwp) || 0;
  for (const tier of PRICE_CURVE) {
    if (size <= tier.maxKwp) return tier.pricePerWp;
  }
  return PRICE_CURVE.at(-1).pricePerWp;
}

const DEFAULT_PERFORMANCE_RATIO = 0.8;

export function parseInverterKw(model) {
  const text = normalizeText(model);
  // "Deye 10k" → 10, "SUN-6K-G" → 6, "12kw" → 12, "3.6k" → 3.6, "8000w" → 8
  const kwMatch = text.match(/(\d+[.,]?\d*)\s*k(?:w|va)?/);
  if (kwMatch) return parseFloat(kwMatch[1].replace(",", "."));
  const wMatch = text.match(/(\d{3,6})\s*w/);
  if (wMatch) return parseFloat(wMatch[1]) / 1000;
  return null;
}

export function calculateSystem(input) {
  const monthlyConsumption = requirePositive(input.monthlyConsumption, "Consumo medio");
  const irradiation = requirePositive(input.irradiation, "Irradiacao");
  const performanceRatio = DEFAULT_PERFORMANCE_RATIO;
  const modulePowerWp = requirePositive(input.modulePowerWp, "Potencia do modulo");
  const effectiveTariff = requirePositive(input.effectiveTariff, "Tarifa efetiva");
  const inverterKw = parseInverterKw(input.inverterModel ?? "");

  const availabilityKwh = availabilityForSupply(input.supplyType);
  const targetConsumptionKwh = Math.max(monthlyConsumption - availabilityKwh, 0);
  const requiredPowerKwp = targetConsumptionKwh / (irradiation * 30 * performanceRatio);
  const maxKwp = inverterKw != null ? inverterKw * 1.2 : Infinity;
  const cappedPowerKwp = Math.min(requiredPowerKwp, maxKwp);
  const moduleCount = Math.max(1, Math.ceil((cappedPowerKwp * 1000) / modulePowerWp));
  const installedPowerKwp = (moduleCount * modulePowerWp) / 1000;
  const pricePerWp = getPricePerWp(installedPowerKwp);
  const monthlyGenerationKwh = installedPowerKwp * irradiation * 30 * performanceRatio;
  const annualGenerationKwh = monthlyGenerationKwh * 12;
  const investment = installedPowerKwp * 1000 * pricePerWp;
  const compensatedEnergyKwh = Math.min(monthlyGenerationKwh, targetConsumptionKwh);
  const monthlySavings = compensatedEnergyKwh * effectiveTariff;
  const annualSavings = monthlySavings * 12;
  const paybackYears = investment / annualSavings;

  return {
    monthlyConsumption,
    availabilityKwh,
    targetConsumptionKwh,
    requiredPowerKwp,
    moduleCount,
    modulePowerWp,
    installedPowerKwp,
    monthlyGenerationKwh,
    annualGenerationKwh,
    investment,
    compensatedEnergyKwh,
    monthlySavings,
    annualSavings,
    paybackYears,
  };
}
