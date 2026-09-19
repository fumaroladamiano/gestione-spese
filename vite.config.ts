import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Deve coincidere con il nome del repository GitHub (indirizzo di GitHub Pages)
export const BASE = "/gestione-spese/";

export default defineConfig({
  base: BASE,
  plugins: [react()],
});
