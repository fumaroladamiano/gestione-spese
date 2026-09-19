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

  // giorni
  today: "Oggi",
  yesterday: "Ieri",

  // categorie predefinite (finché l'utente non le rinomina)
  categoryGroceries: "Spesa",
  categoryTransport: "Trasporti",
  categoryRestaurants: "Ristoranti",
  categoryHome: "Casa",
  categoryHealth: "Salute",
  categoryLeisure: "Svago",
  categorySubscriptions: "Abbonamenti",
  categoryWork: "Lavoro",
  categoryOther: "Altro",

  // metodi di pagamento
  paymentCard: "Carta",
  paymentCash: "Contanti",
  paymentOther: "Altro",

  // Home
  spentIn: (month: string) => `Speso a ${month}`,
  openCharts: "Apri i grafici del mese",
  versus: (month: string) => `vs ${month}`,
  versusSamePeriod: (month: string) => `vs ${month} (stesso periodo)`,
  noComparison: "Nessun confronto",
  previousMonthEmpty: (month: string) => `${month} senza spese`,
  averagePerDay: "Media al giorno",
  lastSevenDays: "Ultimi 7 giorni",
  topCategories: "Top categorie",
  recentExpenses: "Ultime spese",
  seeAll: "Vedi tutte",
  noExpensesTitle: "Nessuna spesa",
  firstExpenseHint: "Registra la prima spesa: bastano 3 tocchi.",

  // Storico
  historyEmpty: "Le spese registrate compariranno qui, divise per giorno.",
  edit: "Modifica",
  delete: "Elimina",
  recurring: "Ricorrente",
  expenseRowLabel: (
    amount: string,
    category: string,
    note: string,
    day: string,
    method: string,
  ) =>
    note
      ? `${amount}, ${category}, ${note}, ${day}, ${method}`
      : `${amount}, ${category}, ${day}, ${method}`,
  dayTotal: (day: string, amount: string) => `${day}, totale ${amount}`,

  // filtri dello storico
  filters: "Filtri",
  month: "Mese",
  allMonths: "Tutti i mesi",
  categories: "Categorie",
  oneOrMore: "anche più di una",
  day: "Giorno",
  anyDay: "Qualsiasi",
  reset: "Azzera",
  filteredTotal: "Totale filtrato",
  noMatch: "Nessuna spesa corrisponde a questi filtri.",
  clearFilters: "Azzera filtri",
  showResults: (count: string, amount: string) => `Mostra ${count} · ${amount}`,
  searchNotes: "Cerca nelle note",
  searchPlaceholder: "Es. Esselunga, benzina",
  searchChip: (query: string) => `“${query}”`,
  removeSearch: "Togli la ricerca",
  previousMonth: "Mese precedente",
  nextMonth: "Mese successivo",

  // foglio spesa
  cancel: "Annulla",
  save: "Salva",
  newExpense: "Nuova spesa",
  editExpense: "Modifica spesa",
  amount: "Importo",
  category: "Categoria",
  date: "Data",
  pickDate: "Scegli data",
  paymentMethod: "Metodo di pagamento",
  notePlaceholder: "Nota (es. Esselunga, benzina)",
  note: "Nota",
  fieldValue: (field: string, value: string) => `${field}: ${value}`,
  deleteKey: "Cancella",
  deleteExpense: "Elimina spesa",
  expenseAdded: (amount: string, category: string) =>
    `${amount} aggiunti a ${category}`,
  expenseUpdated: "Spesa aggiornata",
  expenseDeleted: "Spesa eliminata",
  expenseRestored: "Spesa ripristinata",
  undo: "Annulla",
  discardNewTitle: "Scartare questa spesa?",
  discardChangesTitle: "Scartare le modifiche?",
  discardMessage: "I dati inseriti andranno persi.",
  discard: "Scarta",

  // impostazioni
  personalization: "Personalizzazione",
  appearance: "Aspetto",
  themeAuto: "Automatico",
  themeLight: "Chiaro",
  themeDark: "Scuro",
  language: "Lingua",
  languageItalian: "Italiano",
  languageEnglish: "English",
  defaultPaymentMethod: "Pagamento predefinito",

  // dati e backup
  dataAndBackup: "Dati e backup",
  exportJson: "Esporta backup (JSON)",
  exportCsv: "Esporta per Excel (CSV)",
  importBackup: "Importa backup",
  lastBackup: "Ultimo backup",
  never: "Mai",
  daysAgo: (n: number) => (n === 1 ? "1 giorno fa" : `${String(n)} giorni fa`),
  dataFooter:
    "I dati restano solo su questo iPhone e vengono cancellati se rimuovi l'icona dalla Home. Esporta un backup ogni tanto e salvalo su File › iCloud Drive.",
  exportBackup: "Esporta backup",
  exportForExcel: "Esporta per Excel",
  fileSummary: (name: string, size: string) => `${name} · ${size}`,
  share: "Condividi…",
  downloadFile: "Scarica file",
  copyToClipboard: "Copia negli appunti",
  backupShared: "Backup condiviso",
  shareFailed: "Condivisione non riuscita",
  fileDownloaded: (name: string) => `Scaricato ${name}`,
  copied: "Copiato negli appunti",
  copyFailed: "Il browser non consente la copia",
  importSummary: (expenses: string, categories: string) =>
    `${expenses} · ${categories}`,
  nCategories: (n: number) =>
    n === 1 ? "1 categoria" : `${String(n)} categorie`,
  mergeData: "Unisci ai dati attuali",
  replaceAll: "Sostituisci tutto",
  invalidBackup: "File non valido: serve un backup JSON di Spese",
  backupRestored: (n: number) =>
    n === 1 ? "Ripristinata 1 spesa" : `Ripristinate ${String(n)} spese`,
  backupMerged: (n: number) =>
    n === 1 ? "Aggiunta 1 spesa" : `Aggiunte ${String(n)} spese`,
  nothingNew: "Nessuna spesa nuova da aggiungere",

  // app
  appSection: "App",
  status: "Stato",
  installed: "Installata ✓",
  openInSafari: "Aperta in Safari",
  persistentStorage: "Archiviazione persistente",
  persistOn: "Attiva ✓",
  persistOff: "Non concessa",
  persistUnsupported: "Non supportata",
  persistChecking: "Verifica…",
  storageUsed: "Spazio usato",
  version: "Versione",
  appFooter:
    "Safari concede di norma l'archiviazione persistente alle app aggiunte alla schermata Home.",

  // installazione
  installBannerTitle: "Installa Spese sulla Home",
  installBannerSubtitle: "Offline e a schermo intero · Come fare ›",
  installTitle: "Installa Spese",
  installIntro:
    "Usala come un'app: a schermo intero, offline e sempre a portata di mano sulla schermata Home.",
  installStep1: "Tocca Condividi nella barra di Safari",
  installStep2: "Scorri e tocca Aggiungi alla schermata Home",
  installStep3: "Tocca Aggiungi, poi apri Spese dall'icona sulla Home",
  installWarning:
    "Installala prima di inserire spese. I dati salvati in Safari non passano all'app installata. Rimuovendo l'icona dalla Home i dati vengono cancellati: esporta un backup ogni tanto.",
  installExportFirst: "Hai già delle spese? Esporta un backup",
  gotIt: "Ho capito",

  // aggiornamenti dell'app
  newVersionAvailable: "Nuova versione disponibile",
  update: "Aggiorna",
  close: "Chiudi",

  // errori
  errorInvalidAmount: "Importo non valido",
  errorFutureDate: "Non si possono registrare spese future",
  errorCategory: "Categoria non disponibile",
  errorGeneric: "Operazione non riuscita, riprova",

  // conteggi
  nExpenses: (n: number) => (n === 1 ? "1 spesa" : `${String(n)} spese`),
};
