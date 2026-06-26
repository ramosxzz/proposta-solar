import { parseElectricBill } from "./bill-parser.js";
import { readDocument } from "./document-reader.js";
import { loadIrradiation } from "./irradiation.js";
import { calculateAverageConsumption, calculateSystem } from "./solar-calculator.js";
import { loadSettings, saveSettings } from "./settings.js";
import { createProposalModel, formatCurrency, formatNumber } from "./proposal.js";
import { calculatePreviewScale } from "./layout.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  settings: loadSettings(),
  bill: null,
  system: null,
  irradiation: null,
  proposal: null,
  extractionMethod: "",
};

const panels = $$("[data-step]");
const indicators = $$("[data-step-indicator]");
const fileInput = $("#bill-file");
const uploadZone = $("#upload-zone");

function setStep(step) {
  const order = ["upload", "review", "result", "proposal"];
  const activeIndex = order.indexOf(step);
  panels.forEach((panel) => {
    const active = panel.dataset.step === step;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
  indicators.forEach((indicator) => {
    const index = order.indexOf(indicator.dataset.stepIndicator);
    indicator.classList.toggle("is-active", index === activeIndex);
    indicator.classList.toggle("is-complete", index < activeIndex);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (step === "proposal") fitProposalPreview();
}

function fitProposalPreview() {
  const viewport = $(".document-viewport");
  const stage = $("#proposal-stage");
  const documentElement = $("#proposal-document");
  if (!viewport || !stage || !documentElement) return;

  const scale = calculatePreviewScale(viewport.clientWidth);
  documentElement.style.transform = `scale(${scale})`;
  stage.style.width = `${794 * scale}px`;
  stage.style.height = `${documentElement.scrollHeight * scale}px`;
  stage.dataset.scale = String(scale);
}

function showError(element, message) {
  element.textContent = message;
  element.hidden = !message;
}

function setProcessing(active, detail = "") {
  $("#processing").hidden = !active;
  uploadZone.hidden = active;
  if (detail) $("#processing-detail").textContent = detail;
}

function updateProgress(message) {
  $("#processing-detail").textContent = message;
  const match = message.match(/(\d+)%/);
  const progress = match ? Number(match[1]) / 100 : Math.min(.85, .2 + message.length / 120);
  $("#progress-bar").style.transform = `scaleX(${progress})`;
}

async function processFile(file) {
  showError($("#upload-error"), "");
  if (!file) return;
  if (file.size > 15 * 1024 * 1024) {
    showError($("#upload-error"), "O arquivo excede 15 MB. Envie uma versão menor.");
    return;
  }

  setProcessing(true, "Preparando o documento");
  try {
    const extraction = await readDocument(file, updateProgress);
    state.extractionMethod = extraction.method;
    state.bill = parseElectricBill(extraction.text);
    populateReview(state.bill);
    setStep("review");
  } catch (error) {
    showError($("#upload-error"), error.message || "Não foi possível ler esta conta.");
  } finally {
    setProcessing(false);
    fileInput.value = "";
  }
}

function setValue(selector, value) {
  $(selector).value = value ?? "";
}

function populateReview(bill) {
  setValue("#customer-name", bill.customerName);
  setValue("#customer-address", bill.address);
  setValue("#customer-city", bill.city);
  setValue("#customer-state", bill.state);
  setValue("#distributor", bill.distributor);
  setValue("#supply-type", bill.supplyType || "Monofasico");
  setValue("#bill-total", bill.billTotal);
  setValue("#current-consumption", bill.currentConsumptionKwh);
  setValue("#energy-subtotal", bill.energySubtotal);
  setValue("#public-lighting", bill.publicLighting ?? 0);

  const historyGrid = $("#history-grid");
  historyGrid.replaceChildren();
  const history = bill.history.length
    ? bill.history
    : [{ month: "ATUAL", year: new Date().getFullYear(), kwh: bill.currentConsumptionKwh ?? "" }];
  for (const [index, item] of history.entries()) {
    const label = document.createElement("label");
    label.className = "history-item";
    label.innerHTML = `<span></span><input type="number" min="1" step="1" required data-history-index="${index}">`;
    $("span", label).textContent = `${item.month} ${String(item.year).slice(-2)}`;
    $("input", label).value = item.kwh;
    historyGrid.append(label);
  }
  $("#history-count").textContent = `${history.length} ${history.length === 1 ? "mês identificado" : "meses identificados"}`;

  const status = $("#extraction-status");
  if (bill.warnings.length) {
    status.style.color = "var(--error)";
    status.style.background = "#f8e7e4";
    status.textContent = `${state.extractionMethod === "ocr" ? "OCR concluído" : "PDF lido"}. Confira: ${bill.warnings.join(" ")}`;
  } else {
    status.removeAttribute("style");
    status.textContent = `${state.extractionMethod === "ocr" ? "OCR concluído" : "Texto do PDF identificado"}. Os campos principais foram preenchidos automaticamente.`;
  }
}

function collectReviewedBill() {
  const history = $$("[data-history-index]").map((input, index) => ({
    month: state.bill.history[index]?.month ?? `M${index + 1}`,
    year: state.bill.history[index]?.year ?? new Date().getFullYear(),
    kwh: Number(input.value),
  })).filter((item) => item.kwh > 0);
  const currentConsumptionKwh = Number($("#current-consumption").value);
  const energySubtotal = Number($("#energy-subtotal").value);

  return {
    customerName: $("#customer-name").value.trim(),
    address: $("#customer-address").value.trim(),
    city: $("#customer-city").value.trim(),
    state: $("#customer-state").value.trim().toUpperCase(),
    distributor: $("#distributor").value.trim(),
    supplyType: $("#supply-type").value,
    billTotal: Number($("#bill-total").value),
    currentConsumptionKwh,
    energySubtotal,
    publicLighting: Number($("#public-lighting").value) || 0,
    effectiveEnergyTariff: energySubtotal / currentConsumptionKwh,
    history,
    warnings: [],
  };
}

async function dimensionSystem(event) {
  event.preventDefault();
  showError($("#review-error"), "");
  if (!event.currentTarget.reportValidity()) return;

  try {
    const roofPhotoFile = $("#roof-photo").files[0];
    const roofPhotoDataUrl = roofPhotoFile ? await fileToDataUrl(roofPhotoFile, "Não foi possível ler a foto do telhado.") : "";
    state.bill = collectReviewedBill();
    state.irradiation = await loadIrradiation(state.bill.city, state.bill.state);
    const monthlyConsumption = calculateAverageConsumption(state.bill.history.map((item) => item.kwh));
    state.system = calculateSystem({
      monthlyConsumption,
      supplyType: state.bill.supplyType,
      irradiation: state.irradiation.annual,
      modulePowerWp: Number($("#module-power").value),
      effectiveTariff: state.bill.effectiveEnergyTariff,
      inverterModel: $("#inverter-model").value.trim(),
      pricePerWp: state.settings.pricePerWp,
      performanceRatio: state.settings.performanceRatio,
    });
    state.proposal = createProposalModel({
      bill: state.bill,
      system: state.system,
      settings: state.settings,
      inverterModel: $("#inverter-model").value.trim(),
      moduleWarrantyYears: Number($("#module-warranty").value),
      inverterWarrantyYears: Number($("#inverter-warranty").value),
      roofPhotoDataUrl,
      irradiation: state.irradiation,
    });
    renderResult();
    renderProposal();
    setStep("result");
  } catch (error) {
    showError($("#review-error"), error.message || "Não foi possível dimensionar o sistema.");
  }
}

function renderResult() {
  const model = state.proposal;
  $("#result-location").textContent = `${model.customerName} · ${model.cityState}`;
  $("#result-power").textContent = `${formatNumber(model.installedPowerKwp, 2)} kWp`;
  $("#result-equipment").textContent = `${model.moduleDescription} · ${model.inverterModel}`;
  $("#result-average").textContent = `${formatNumber(model.averageConsumptionKwh, 0)} kWh`;
  $("#result-generation").textContent = `${formatNumber(model.monthlyGenerationKwh, 0)} kWh`;
  $("#result-savings").textContent = formatCurrency(model.monthlySavings);
  $("#result-payback").textContent = `${formatNumber(model.paybackYears, 1)} anos`;
  $("#solar-source-note").textContent = state.irradiation.fallback
    ? "A cidade não foi localizada na base LABREN/INPE. Foi usada a premissa conservadora de 4,5 h solares por dia; revise antes de enviar."
    : `Irradiação média de ${formatNumber(state.irradiation.annual, 3)} h solares/dia para ${state.bill.city}, conforme Atlas Brasileiro de Energia Solar (LABREN/INPE).`;
}

function renderProposal() {
  const model = state.proposal;
  $$('[data-bind]').forEach((element) => {
    element.textContent = model[element.dataset.bind] || "—";
  });
  $$('[data-bind-number]').forEach((element) => {
    element.textContent = formatNumber(model[element.dataset.bindNumber], Number(element.dataset.digits ?? 1));
  });
  $$('[data-bind-currency]').forEach((element) => {
    element.textContent = formatCurrency(model[element.dataset.bindCurrency]);
  });

  const logo = $("#proposal-logo");
  const brandMark = $("#proposal-brand-mark");
  if (logo) {
    logo.hidden = !model.logoDataUrl;
    if (model.logoDataUrl) logo.src = model.logoDataUrl;
  }
  if (brandMark) brandMark.hidden = Boolean(model.logoDataUrl);

  renderRoofPhoto();
  renderConsumptionChart();
  renderGenerationChart();
  renderSystemComparisonChart();
  renderFinancialProjection();
  fitProposalPreview();
}

function renderRoofPhoto() {
  const image = $("#roof-photo-image");
  const placeholder = $("#roof-photo-placeholder");
  if (!image || !placeholder) return;
  const roofPhotoDataUrl = state.proposal.roofPhotoDataUrl;
  image.hidden = !roofPhotoDataUrl;
  placeholder.hidden = Boolean(roofPhotoDataUrl);
  if (roofPhotoDataUrl) image.src = roofPhotoDataUrl;
}

function renderFinancialProjection() {
  const { financialProjection } = state.proposal;
  const tableBody = $("#financial-projection-body");
  tableBody.replaceChildren();

  const immediateRow = document.createElement("tr");
  const immediateValues = ["Imediato", formatCurrency(0), formatCurrency(0), formatCurrency(-state.proposal.investment)];
  for (const value of immediateValues) {
    const cell = document.createElement("td");
    cell.textContent = value;
    immediateRow.append(cell);
  }
  tableBody.append(immediateRow);

  for (const row of financialProjection.rows) {
    const rowElement = document.createElement("tr");
    if (row.year === financialProjection.paybackYear) {
      rowElement.classList.add("is-payback-year");
    }

    const values = [
      `${row.year}º ano`,
      formatCurrency(row.annualSavings),
      formatCurrency(row.accumulatedSavings),
      formatCurrency(row.balance),
    ];
    for (const value of values) {
      const cell = document.createElement("td");
      cell.textContent = value;
      rowElement.append(cell);
    }
    tableBody.append(rowElement);
  }

  $("#ten-year-savings").textContent = formatCurrency(state.proposal.tenYearSavings);
  const paybackLabel = financialProjection.paybackYear ? `${financialProjection.paybackYear}º ano` : "Acima de 20 anos";
  const paybackElement = $("#projection-payback-year");
  if (paybackElement) paybackElement.textContent = paybackLabel;
}

function renderConsumptionChart() {
  const chart = $("#consumption-chart");
  if (!chart) return;
  chart.replaceChildren();
  const history = [...state.bill.history].slice(0, 12).reverse();
  const max = Math.max(...history.map((item) => item.kwh), 1);
  for (const item of history) {
    const bar = document.createElement("div");
    bar.style.height = `${Math.max(4, item.kwh / max * 100)}%`;
    bar.innerHTML = "<span></span>";
    $("span", bar).textContent = item.month;
    chart.append(bar);
  }
}

function renderGenerationChart() {
  const chart = $("#generation-chart");
  if (!chart) return;
  chart.replaceChildren();
  const max = Math.max(...state.proposal.monthlyProjection.map((item) => item.kwh), 1);
  for (const item of state.proposal.monthlyProjection) {
    const bar = document.createElement("div");
    bar.style.height = `${Math.max(4, item.kwh / max * 100)}%`;
    bar.innerHTML = "<b></b><span></span>";
    $("b", bar).textContent = formatNumber(item.kwh, 0);
    $("span", bar).textContent = item.label;
    chart.append(bar);
  }
}

function renderSystemComparisonChart() {
  const chart = $("#system-comparison-chart");
  if (!chart) return;
  chart.replaceChildren();
  const generation = state.proposal.monthlyProjection;
  const consumption = state.proposal.averageConsumptionKwh;
  const max = Math.max(...generation.map((item) => item.kwh), consumption, 1);
  for (const item of generation) {
    const group = document.createElement("div");
    group.className = "system-month";
    const generationBar = document.createElement("span");
    generationBar.className = "generation-bar";
    generationBar.style.height = `${Math.max(4, item.kwh / max * 100)}%`;
    const consumptionBar = document.createElement("span");
    consumptionBar.className = "consumption-bar";
    consumptionBar.style.height = `${Math.max(4, consumption / max * 100)}%`;
    const generationValue = document.createElement("b");
    generationValue.textContent = formatNumber(item.kwh, 0);
    const consumptionValue = document.createElement("em");
    consumptionValue.textContent = formatNumber(consumption, 0);
    group.append(generationBar, consumptionBar, generationValue, consumptionValue);
    chart.append(group);
  }
}

async function downloadProposal() {
  showError($("#pdf-error"), "");
  if (!globalThis.html2canvas || !globalThis.jspdf) {
    showError($("#pdf-error"), "O gerador de PDF não foi carregado. Verifique sua conexão.");
    return;
  }
  const button = $("#download-pdf");
  const documentElement = $("#proposal-document");
  const previousTransform = documentElement.style.transform;
  button.disabled = true;
  button.textContent = "Gerando PDF...";
  const safeName = state.proposal.customerName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  try {
    documentElement.style.transform = "none";
    const pages = $$(".proposal-page", documentElement);
    const pdf = new globalThis.jspdf.jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    for (const [i, page] of pages.entries()) {
      if (i > 0) pdf.addPage();
      const canvas = await globalThis.html2canvas(page, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.97), "JPEG", 0, 0, 210, 297);
    }
    pdf.save(`proposta-solar-${safeName}.pdf`);
  } catch (error) {
    showError($("#pdf-error"), error.message || "Não foi possível gerar o PDF.");
  } finally {
    documentElement.style.transform = previousTransform;
    fitProposalPreview();
    button.disabled = false;
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"></path><path d="M5 21h14"></path></svg> Baixar PDF';
  }
}

function fillSettingsForm() {
  setValue("#setting-company", state.settings.companyName);
  setValue("#setting-responsible", state.settings.responsibleName);
  setValue("#setting-phone", state.settings.phone);
  setValue("#setting-email", state.settings.email);
  $("#setting-logo").value = "";
}

function fileToDataUrl(file, errorMessage = "Não foi possível ler o arquivo.") {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(errorMessage));
    reader.readAsDataURL(file);
  });
}

async function handleSettingsSubmit(event) {
  if (event.submitter?.id !== "save-settings") return;
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const logoFile = $("#setting-logo").files[0];
  const logoDataUrl = logoFile ? await fileToDataUrl(logoFile, "Não foi possível ler o logotipo.") : state.settings.logoDataUrl;
  state.settings = saveSettings(localStorage, {
    companyName: $("#setting-company").value,
    responsibleName: $("#setting-responsible").value,
    phone: $("#setting-phone").value,
    email: $("#setting-email").value,
    logoDataUrl,
  });
  $("#settings-dialog").close();
  if (state.system) {
    state.system = calculateSystem({
      monthlyConsumption: state.system.monthlyConsumption,
      supplyType: state.bill.supplyType,
      irradiation: state.irradiation.annual,
      modulePowerWp: state.system.modulePowerWp,
      effectiveTariff: state.bill.effectiveEnergyTariff,
      inverterModel: state.proposal.inverterModel,
      pricePerWp: state.settings.pricePerWp,
      performanceRatio: state.settings.performanceRatio,
    });
    state.proposal = createProposalModel({
      bill: state.bill,
      system: state.system,
      settings: state.settings,
      inverterModel: state.proposal.inverterModel,
      moduleWarrantyYears: state.proposal.moduleWarrantyYears,
      inverterWarrantyYears: state.proposal.inverterWarrantyYears,
      roofPhotoDataUrl: state.proposal.roofPhotoDataUrl,
      irradiation: state.irradiation,
    });
    renderResult();
    renderProposal();
  }
}

fileInput.addEventListener("change", () => processFile(fileInput.files[0]));
for (const eventName of ["dragenter", "dragover"]) {
  uploadZone.addEventListener(eventName, (event) => { event.preventDefault(); uploadZone.classList.add("is-dragging"); });
}
for (const eventName of ["dragleave", "drop"]) {
  uploadZone.addEventListener(eventName, (event) => { event.preventDefault(); uploadZone.classList.remove("is-dragging"); });
}
uploadZone.addEventListener("drop", (event) => processFile(event.dataTransfer.files[0]));
$("#review-form").addEventListener("submit", dimensionSystem);
$("#back-upload").addEventListener("click", () => setStep("upload"));
$("#back-review").addEventListener("click", () => setStep("review"));
$("#show-proposal").addEventListener("click", () => setStep("proposal"));
$("#back-result").addEventListener("click", () => setStep("result"));
$("#download-pdf").addEventListener("click", downloadProposal);
$("#open-settings").addEventListener("click", () => { fillSettingsForm(); $("#settings-dialog").showModal(); });
$("#settings-form").addEventListener("submit", handleSettingsSubmit);

let resizeFrame;
window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(fitProposalPreview);
});

fillSettingsForm();
setStep("upload");

const localTestParams = new URLSearchParams(location.search);
if (["127.0.0.1", "localhost"].includes(location.hostname) && localTestParams.get("fixture") === "rge") {
  try {
    const text = await fetch("./tests/fixtures/rge-sample.txt").then((response) => response.text());
    state.extractionMethod = "text";
    state.bill = parseElectricBill(text);
    populateReview(state.bill);
    setStep("review");
    if (localTestParams.get("autocalc") === "1") {
      $("#inverter-model").value = "Deye SUN-6K-G";
      await dimensionSystem({ preventDefault() {}, currentTarget: $("#review-form") });
      if (state.proposal) setStep("proposal");
    }
  } catch (error) {
    showError($("#upload-error"), error.message);
  }
}
