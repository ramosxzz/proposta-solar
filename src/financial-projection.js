function requireNonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} deve ser um número não negativo.`);
  }
}

export function createFinancialProjection({
  annualSavings,
  investment,
  years = 20,
  annualTariffEscalation = 0.05,
  annualGenerationDegradation = 0.005,
}) {
  requireNonNegative(annualSavings, "Economia anual");
  requireNonNegative(investment, "Investimento");
  requireNonNegative(annualTariffEscalation, "Reajuste da tarifa");

  if (!Number.isInteger(years) || years <= 0) {
    throw new Error("Anos deve ser um número inteiro positivo.");
  }
  if (!Number.isFinite(annualGenerationDegradation)
    || annualGenerationDegradation < 0
    || annualGenerationDegradation >= 1) {
    throw new Error("Degradação deve estar entre 0 e 1.");
  }

  const annualFactor = (1 + annualTariffEscalation) * (1 - annualGenerationDegradation);
  const rows = [];
  let accumulatedSavings = 0;
  let paybackYear = null;

  for (let year = 1; year <= years; year += 1) {
    const projectedAnnualSavings = annualSavings * annualFactor ** (year - 1);
    accumulatedSavings += projectedAnnualSavings;
    const balance = accumulatedSavings - investment;
    rows.push({ year, annualSavings: projectedAnnualSavings, accumulatedSavings, balance });
    if (paybackYear === null && balance >= 0) paybackYear = year;
  }

  return { rows, paybackYear, totalSavings: accumulatedSavings };
}
