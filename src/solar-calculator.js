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

export function calculateSystem(input) {
  const monthlyConsumption = requirePositive(input.monthlyConsumption, "Consumo medio");
  const irradiation = requirePositive(input.irradiation, "Irradiacao");
  const performanceRatio = requirePositive(input.performanceRatio, "Performance ratio");
  const modulePowerWp = requirePositive(input.modulePowerWp, "Potencia do modulo");
  const pricePerWp = requirePositive(input.pricePerWp, "Preco por Wp");
  const effectiveTariff = requirePositive(input.effectiveTariff, "Tarifa efetiva");

  if (performanceRatio > 1) {
    throw new Error("Performance ratio deve ser menor ou igual a 1.");
  }

  const availabilityKwh = availabilityForSupply(input.supplyType);
  const targetConsumptionKwh = Math.max(monthlyConsumption - availabilityKwh, 0);
  const requiredPowerKwp = targetConsumptionKwh / (irradiation * 30 * performanceRatio);
  const moduleCount = Math.max(1, Math.ceil((requiredPowerKwp * 1000) / modulePowerWp));
  const installedPowerKwp = (moduleCount * modulePowerWp) / 1000;
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
