import { defineConfig, devices } from "@playwright/test";

// Test end-to-end solo su WebKit (motore di Safari), contro la build servita da `vite preview`
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173/gestione-spese/",
    trace: "retain-on-failure",
  },
  projects: [{ name: "webkit", use: { ...devices["iPhone 15"] } }],
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173/gestione-spese/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
