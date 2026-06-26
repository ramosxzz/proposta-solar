import { copyFile, mkdir, readdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/src", { recursive: true });
await mkdir("dist/data", { recursive: true });

for (const file of ["index.html", "styles.css", "favicon.svg", "FOTO1.png", "foto2.png", "hv-logo.png", "_headers"]) {
  await copyFile(file, `dist/${file}`);
}

for (const file of await readdir("src")) {
  if (file.endsWith(".js")) await copyFile(`src/${file}`, `dist/src/${file}`);
}

await copyFile("data/solar-brazil.json", "dist/data/solar-brazil.json");
console.log("Pacote de producao gerado em dist/");
