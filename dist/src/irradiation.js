let solarDataPromise;

export function normalizePlace(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function findIrradiation(city, state, records) {
  const key = `${normalizePlace(city)}|${normalizePlace(state)}`;
  const match = records?.[key];
  if (match) return { ...match, fallback: false };
  return { annual: 4.5, monthly: Array(12).fill(4.5), fallback: true };
}

export async function loadIrradiation(city, state) {
  solarDataPromise ??= fetch("./data/solar-brazil.json").then((response) => {
    if (!response.ok) throw new Error("Nao foi possivel carregar a base solar.");
    return response.json();
  });
  return findIrradiation(city, state, await solarDataPromise);
}
