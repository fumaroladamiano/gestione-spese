import type { Dictionary } from "./dictionary";

// Stesse chiavi di it.ts: una traduzione mancante o in più è un errore di typecheck
export const en = {
  appName: "Spese",

  mainNavigation: "Main navigation",
  tabHome: "Home",
  tabHistory: "History",
  tabCharts: "Charts",
  tabSettings: "Settings",
  addExpense: "Add expense",

  homeTitle: "Expenses",
  historyTitle: "History",
  chartsTitle: "Charts",
  settingsTitle: "Settings",
  comingSoon: "Coming in a future version.",

  personalization: "Personalization",
  appearance: "Appearance",
  themeAuto: "Automatic",
  themeLight: "Light",
  themeDark: "Dark",
  language: "Language",
  languageItalian: "Italiano",
  languageEnglish: "English",

  newVersionAvailable: "New version available",
  update: "Update",
  close: "Close",

  nExpenses: (n: number) => (n === 1 ? "1 expense" : `${String(n)} expenses`),
} satisfies Dictionary;
