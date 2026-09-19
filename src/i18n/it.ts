// Dizionario italiano: è la fonte del tipo Dictionary (vedi lingue.md)
export const it = {
  // il nome dell'app resta "Spese" in entrambe le lingue
  appName: "Spese",

  // navigazione
  mainNavigation: "Navigazione principale",
  tabHome: "Home",
  tabHistory: "Storico",
  tabCharts: "Grafici",
  tabSettings: "Impostazioni",
  addExpense: "Aggiungi spesa",

  // titoli delle schermate
  homeTitle: "Spese",
  historyTitle: "Storico",
  chartsTitle: "Grafici",
  settingsTitle: "Impostazioni",
  comingSoon: "In arrivo nelle prossime versioni.",

  // impostazioni
  personalization: "Personalizzazione",
  appearance: "Aspetto",
  themeAuto: "Automatico",
  themeLight: "Chiaro",
  themeDark: "Scuro",
  language: "Lingua",
  languageItalian: "Italiano",
  languageEnglish: "English",

  // aggiornamenti dell'app
  newVersionAvailable: "Nuova versione disponibile",
  update: "Aggiorna",
  close: "Chiudi",

  // conteggi
  nExpenses: (n: number) => (n === 1 ? "1 spesa" : `${String(n)} spese`),
};
