import { createFinancialProjection } from "./financial-projection.js";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const formatCurrency = (value) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
}).format(Number(value) || 0);

export const formatNumber = (value, digits = 1) => new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
}).format(Number(value) || 0);

export function createProposalModel({ bill, system, settings, inverterModel, irradiation, issuedAt = new Date() }) {
  const performanceRatio = Number(settings.performanceRatio) || 0.8;
  const monthlyProjection = irradiation.monthly.map((solarHours, index) => ({
    label: MONTH_LABELS[index],
    kwh: system.installedPowerKwp * solarHours * MONTH_DAYS[index] * performanceRatio,
  }));
  const customerCode = String(bill.customerName ?? "PROPOSTA")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase();
  const dateCode = issuedAt.toISOString().slice(0, 10).replace(/-/g, "");
  const annualTariffEscalation = 0.05;
  const annualGenerationDegradation = 0.005;
  const financialProjection = createFinancialProjection({
    annualSavings: system.annualSavings,
    investment: system.investment,
    annualTariffEscalation,
    annualGenerationDegradation,
  });

  return {
    proposalCode: `${dateCode}-${customerCode || "SOLAR"}`,
    issuedAt: issuedAt.toLocaleDateString("pt-BR"),
    validUntil: new Date(issuedAt.getTime() + 10 * 86400000).toLocaleDateString("pt-BR"),
    customerName: bill.customerName,
    address: bill.address,
    cityState: [bill.city, bill.state].filter(Boolean).join(" - "),
    currentBill: bill.billTotal,
    currentConsumptionKwh: bill.currentConsumptionKwh,
    averageConsumptionKwh: system.monthlyConsumption,
    moduleDescription: `${system.moduleCount} módulos de ${formatNumber(system.modulePowerWp, 0)} Wp`,
    inverterModel,
    installedPowerKwp: system.installedPowerKwp,
    monthlyGenerationKwh: system.monthlyGenerationKwh,
    annualGenerationKwh: system.annualGenerationKwh,
    investment: system.investment,
    monthlySavings: system.monthlySavings,
    annualSavings: system.annualSavings,
    paybackYears: system.paybackYears,
    financialProjection,
    annualTariffEscalation,
    annualGenerationDegradation,
    referenceLifetimeYears: 25,
    irradiationAnnual: irradiation.annual,
    monthlyProjection,
    companyName: settings.companyName,
    responsibleName: settings.responsibleName,
    phone: settings.phone,
    email: settings.email,
    logoDataUrl: settings.logoDataUrl,
  };
}
