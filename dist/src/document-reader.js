const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

export function groupTextItems(items, tolerance = 2) {
  const lines = [];

  for (const item of items ?? []) {
    const text = String(item.str ?? "").trim();
    if (!text) continue;
    const x = Number(item.transform?.[4] ?? 0);
    const y = Number(item.transform?.[5] ?? 0);
    let line = lines.find((candidate) => Math.abs(candidate.y - y) <= tolerance);
    if (!line) {
      line = { y, items: [] };
      lines.push(line);
    }
    line.items.push({ x, text });
  }

  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) => line.items.sort((a, b) => a.x - b.x).map((item) => item.text).join(" "))
    .join("\n");
}

async function ocrSource(source, onProgress) {
  if (!globalThis.Tesseract) {
    throw new Error("O recurso de OCR nao foi carregado. Verifique sua conexao e tente novamente.");
  }
  const result = await globalThis.Tesseract.recognize(source, "por+eng", {
    logger: (message) => {
      if (message.status === "recognizing text") {
        onProgress?.(`Reconhecendo a conta: ${Math.round((message.progress ?? 0) * 100)}%`);
      }
    },
  });
  return result.data.text;
}

export async function readDocument(file, onProgress = () => {}) {
  if (!file) throw new Error("Selecione uma conta de energia.");

  if (file.type.startsWith("image/")) {
    onProgress("Iniciando reconhecimento da imagem...");
    return { text: await ocrSource(file, onProgress), method: "ocr" };
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Envie um arquivo PDF, PNG ou JPG.");
  }

  onProgress("Lendo o texto do PDF...");
  const pdfjs = await import(PDFJS_URL);
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pageTexts.push(groupTextItems(content.items));
  }

  const text = pageTexts.join("\n");
  if (text.replace(/\s/g, "").length >= 200) {
    return { text, method: "text" };
  }

  onProgress("PDF sem texto. Iniciando OCR...");
  const ocrPages = [];
  for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 1); pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    ocrPages.push(await ocrSource(canvas, onProgress));
  }

  return { text: ocrPages.join("\n"), method: "ocr" };
}
