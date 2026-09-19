import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Deve coincidere con il nome del repository GitHub (indirizzo di GitHub Pages)
export const BASE = "/gestione-spese/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      // l'app mostra "Nuova versione disponibile · Aggiorna" invece di ricaricarsi da sola
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        id: BASE,
        name: "Spese",
        short_name: "Spese",
        description: "Le mie spese quotidiane",
        lang: "it",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        orientation: "portrait",
        background_color: "#F3F3F8",
        theme_color: "#F3F3F8",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // tutto in precache: l'app funziona offline dal primo avvio completo
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
