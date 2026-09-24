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

  // grafici
  summary: "Riepilogo",
  monthTotal: "Totale del mese",
  byCategory: "Per categoria",
  total: "Totale",
  dailyTrend: "Andamento giornaliero",
  tapBarHint: "Tocca una barra per i dettagli",
  averagePerDayShort: (amount: string) => `media ${amount}/giorno`,
  averageLine: "media",
  seeInHistory: (category: string) => `Vedi ${category} nello storico`,
  openDay: "Apri giorno",
  monthUntilDay: (month: string, day: number) => `${month} (1–${String(day)})`,
  previousTotal: (period: string, amount: string) => `${period}: ${amount}`,
  dayAmount: (day: string, amount: string) => `${day}: ${amount}`,
  categoryShare: (category: string, percent: string, amount: string) =>
    `${category}, ${percent}, ${amount}`,

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
  categorySuggestion: (category: string) => `Categoria suggerita: ${category}`,
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

  // budget
  budget: "Budget",
  monthlyBudget: "Budget mensile",
  noBudget: "Nessuno",
  budgetFooter: "Lascia vuoto per nascondere il budget da Home e Grafici.",
  budgetSet: (amount: string) => `Budget impostato a ${amount}`,
  budgetRemoved: "Budget disattivato",
  budgetOf: (percent: string, budget: string) => `${percent} di ${budget}`,
  budgetRemaining: (amount: string) => `Restano ${amount}`,
  budgetOver: (amount: string) => `Sforato di ${amount}`,
  daysLeft: (n: number) => (n === 1 ? "1 giorno" : `${String(n)} giorni`),
  projection: (amount: string) => `Proiezione a fine mese: ${amount}`,
  projectionOver: (amount: string) =>
    `Proiezione a fine mese: ${amount} — oltre il budget`,

  // gestione categorie
  activeCategories: "Attive",
  archivedCategories: "Archiviate",
  newCategory: "Nuova categoria",
  editCategory: "Modifica categoria",
  categoryName: "Nome",
  categoryNamePlaceholder: "Nome (es. Palestra)",
  color: "Colore",
  colorN: (n: number) => `Colore ${String(n)}`,
  icon: "Icona",
  iconN: (n: number) => `Icona ${String(n)}`,
  categoriesFooter:
    "Le categorie predefinite si possono rinominare e ricolorare. Quelle con spese si archiviano invece di essere eliminate.",
  archiveCategory: "Archivia categoria",
  restoreCategory: "Ripristina categoria",
  deleteCategory: "Elimina categoria",
  otherNotArchivable:
    "“Altro” non si può archiviare: raccoglie le spese generiche.",
  keepExpenses: (n: number) =>
    n === 1
      ? "La spesa esistente resta nello storico."
      : `Le ${String(n)} spese esistenti restano nello storico.`,
  categoryCreated: (name: string) => `Categoria “${name}” creata`,
  categoryUpdated: "Categoria aggiornata",
  categoryArchived: (name: string) => `“${name}” archiviata`,
  categoryRestored: (name: string) => `“${name}” ripristinata`,
  categoryDeleted: "Categoria eliminata",
  back: (label: string) => `Torna a ${label}`,

  // spese ricorrenti
  oneOff: "Una tantum",
  monthly: "Ogni mese",
  recurrence: "Ripetizione",
  expenseAddedMonthly: (amount: string, category: string) =>
    `${amount} aggiunti a ${category} · ogni mese`,
  recurringTitle: "Spese ricorrenti",
  recurringEmpty:
    "Nessuna spesa ricorrente. Scegli “Ogni mese” quando registri una spesa (es. abbonamenti, affitto).",
  recurringFooter:
    "All'apertura dell'app viene registrata la spesa di ogni mese dovuto. Le spese già create restano anche se sospendi o elimini la regola.",
  ruleSummary: (amount: string, day: number) =>
    `${amount} · ogni mese il giorno ${String(day)}`,
  ruleActive: "Attiva",
  ruleSuspended: "Sospesa",
  suspendRule: "Sospendi",
  resumeRule: "Riattiva",
  deleteRule: "Elimina regola",
  ruleSuspendedToast: "Spesa ricorrente sospesa",
  ruleResumedToast: "Spesa ricorrente riattivata",
  ruleDeletedToast: "Regola eliminata",
  editRule: "Modifica regola",
  dayOfMonth: "Giorno del mese",
  dayOfMonthValue: (day: number) => `Giorno ${String(day)}`,
  ruleCategoryFixed: (category: string) =>
    `Categoria: ${category} (per cambiarla, elimina la regola e creala di nuovo)`,
  ruleUpdatedToast: "Regola aggiornata",
  ruleExpensesUpdatedToast: (n: number) =>
    n === 1
      ? "Regola aggiornata e 1 spesa modificata"
      : `Regola aggiornata e ${String(n)} spese modificate`,
  applyAmountTitle: "Nuovo importo",
  applyAmountMessage: (previous: string, next: string) =>
    `L'importo passa da ${previous} a ${next}.`,
  applyAmountFuture: "Solo dalle prossime",
  applyAmountAll: "Anche alle spese già create",

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

  checkUpdates: "Cerca aggiornamenti",
  upToDate: (version: string) => `Hai già l'ultima versione (${version})`,
  updatesUnavailable: "Aggiornamenti disponibili solo nell'app pubblicata",
  backupReminderTitle: "Fai un backup",
  backupReminderNever: "Non hai ancora salvato una copia delle spese.",
  backupReminderDays: (n: number) =>
    `L'ultimo backup è di ${String(n)} giorni fa.`,
  backupReminderAction: "Esporta",

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
  errorDuplicateCategory: "Esiste già una categoria con questo nome",
  errorCategoryLimit: "Puoi avere al massimo 15 categorie attive",
  errorCategoryName: "Scrivi un nome da 1 a 20 caratteri",
  errorGeneric: "Operazione non riuscita, riprova",

  // conteggi
  nExpenses: (n: number) => (n === 1 ? "1 spesa" : `${String(n)} spese`),
};
