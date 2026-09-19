/*
  Genera le icone PNG dell'app in public/ (portafoglio bianco su gradiente indaco, proposta § 1.5).
  Uso: npm run icons — serve solo quando cambia il disegno; i PNG generati sono versionati.
  Usa WebKit di Playwright per disegnarle, così non serve una libreria di immagini.
*/
import { webkit } from "@playwright/test";
import { writeFile } from "node:fs/promises";

// Stesso gradiente del token --gradient-hero (tema chiaro) e glifo "wallet" del prototipo
const GRADIENT =
  "linear-gradient(150deg, #6260e8 0%, #5856d6 48%, #3e3cb6 100%)";
const WALLET_PATHS =
  '<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16" cy="14" r="1.2" fill="#fff"/>';

type IconSpec = {
  file: string;
  size: number;
  /** Lato del glifo rispetto all'icona: più piccolo per l'icona "maskable" (zona sicura). */
  glyph: number;
};

const ICONS: IconSpec[] = [
  { file: "public/apple-touch-icon.png", size: 180, glyph: 0.54 },
  { file: "public/icons/icon-192.png", size: 192, glyph: 0.54 },
  { file: "public/icons/icon-512.png", size: 512, glyph: 0.54 },
  { file: "public/icons/icon-512-maskable.png", size: 512, glyph: 0.42 },
];

function iconHtml({ size, glyph }: IconSpec): string {
  const glyphSize = Math.round(size * glyph);
  return `<!doctype html><html><body style="margin:0">
    <div id="icon" style="width:${String(size)}px;height:${String(size)}px;background:${GRADIENT};display:grid;place-items:center">
      <svg width="${String(glyphSize)}" height="${String(glyphSize)}" viewBox="0 0 24 24" fill="none" stroke="#fff"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${WALLET_PATHS}</svg>
    </div></body></html>`;
}

// Favicon vettoriale per i browser da PC (gradiente a 150° approssimato con x/y)
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0.25" y1="0.07" x2="0.75" y2="0.93">
    <stop offset="0" stop-color="#6260e8"/><stop offset="0.48" stop-color="#5856d6"/><stop offset="1" stop-color="#3e3cb6"/>
  </linearGradient></defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <svg x="14" y="14" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">${WALLET_PATHS}</svg>
</svg>
`;

const browser = await webkit.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const icon of ICONS) {
  await page.setContent(iconHtml(icon));
  // Nessuna trasparenza: iOS riempirebbe di nero le parti trasparenti
  await page
    .locator("#icon")
    .screenshot({ path: icon.file, omitBackground: false });
}
await browser.close();
await writeFile("public/favicon.svg", FAVICON);
console.error(`Icone generate: ${String(ICONS.length + 1)}`);
