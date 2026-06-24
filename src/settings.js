const STORAGE_KEY = "solar-proposal-settings-v1";

export const DEFAULT_SETTINGS = Object.freeze({
  companyName: "Energia Solar",
  responsibleName: "Matheus Ramos",
  phone: "(51) 98984-9699",
  email: "",
  pricePerWp: 3.5,
  performanceRatio: 0.8,
  logoDataUrl: "",
});

const STRING_FIELDS = [
  "companyName",
  "responsibleName",
  "phone",
  "email",
  "logoDataUrl",
];

export function loadSettings(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "null");
    if (!saved || typeof saved !== "object") return { ...DEFAULT_SETTINGS };
    return sanitizeSettings(saved);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(storage = globalThis.localStorage, values = {}) {
  const saved = sanitizeSettings(values);
  storage?.setItem(STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

function sanitizeSettings(values) {
  const sanitized = { ...DEFAULT_SETTINGS };
  for (const field of STRING_FIELDS) {
    if (typeof values[field] === "string") sanitized[field] = values[field].trim();
  }

  const pricePerWp = Number(values.pricePerWp);
  if (Number.isFinite(pricePerWp) && pricePerWp > 0) sanitized.pricePerWp = pricePerWp;

  const performanceRatio = Number(values.performanceRatio);
  if (Number.isFinite(performanceRatio) && performanceRatio > 0 && performanceRatio <= 1) {
    sanitized.performanceRatio = performanceRatio;
  }

  return sanitized;
}
