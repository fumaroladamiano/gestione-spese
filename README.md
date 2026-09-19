# Spese

PWA per iPhone per registrare una spesa in euro in pochi secondi (3 tap + importo) e capire a colpo d'occhio quanto si spende. Funziona interamente sul dispositivo, anche offline, senza account né server.

**App:** <https://fumaroladamiano.github.io/gestione-spese/>

## Funzionalità

- **Inserimento rapido**: tastierino numerico, categoria, Salva. Data (mai futura), nota fino a 40 caratteri e metodo di pagamento sono opzionali. Dalla nota l'app suggerisce una categoria già usata.
- **Home**: totale del mese, andamento giornaliero, categorie principali, promemoria di backup.
- **Storico**: spese raggruppate per giorno, modifica ed eliminazione con swipe e "Annulla", filtri per mese, categorie e giorno (con mini-calendario), ricerca nelle note, totale filtrato. I filtri stanno nell'URL (`#/history?month=2026-09&cat=spesa,casa`).
- **Grafici**: ciambella per categoria, barre giornaliere, confronto con il mese precedente.
- **Budget** mensile con proiezione a fine mese.
- **Spese ricorrenti** mensili (affitto, abbonamenti…), generate automaticamente all'apertura dell'app.
- **Categorie**: 9 predefinite da rinominare, ricolorare o archiviare, più quelle personalizzate (massimo 15 attive).
- **Backup** in JSON (esporta, importa con "Sostituisci tutto" o "Unisci") ed **esportazione CSV**.
- **Italiano e inglese**, tema chiaro/scuro/automatico, avviso quando c'è una nuova versione.

## Cosa non è

È un'app per **uso personale**: una persona, un iPhone. Non ha backend, login, sincronizzazione tra dispositivi né collegamenti a banche o carte, e non registra entrate. Tutti i dati restano in IndexedDB sul dispositivo; l'app non fa chiamate di rete a runtime.

Su PC e Android funziona "best effort": non è testata e ogni dispositivo ha i suoi dati.

## Installazione sull'iPhone

1. Apri l'indirizzo dell'app in **Safari**.
2. Tocca **Condividi** → **Aggiungi alla schermata Home**.
3. Avvia **Spese** dall'icona: si apre a schermo intero e funziona offline.

Da sapere:

- Safari e l'app installata hanno **spazi dati separati**: usa sempre l'app dalla Home.
- **Se rimuovi l'icona, i dati vengono cancellati.** Esporta un backup ogni tanto (Impostazioni → Backup) e salvalo su iCloud Drive con il foglio di condivisione.
- All'avvio l'app installata chiede a Safari l'archiviazione persistente (`navigator.storage.persist()`), così i dati non vengono eliminati quando lo spazio scarseggia.

## Stack tecnologico

| Area | Scelta |
|---|---|
| Build e linguaggio | Vite + React 19 + TypeScript in strict mode |
| PWA | `vite-plugin-pwa` (Workbox) + `workbox-window` |
| Routing | `react-router` con `createHashRouter` |
| Dati | `dexie` + `dexie-react-hooks` (IndexedDB, `useLiveQuery`) |
| Stato UI e preferenze | `zustand` (+ `persist` su `localStorage`) |
| Animazioni | `motion` con `LazyMotion` (fogli dal basso, swipe, transizioni) |
| Date | `date-fns` con i locale `it` e `enIE` |
| Numeri e valuta | `Intl.NumberFormat`, senza librerie |
| Lingue | Dizionari tipizzati in `src/i18n` con un helper `t()` su misura |
| Validazione | `zod` (backup importati e parametri dell'URL) |
| Icone | `lucide-react` |
| Stili | CSS Modules + variabili CSS (token del design system) |
| Grafici | Componenti SVG su misura |
| Test | Vitest + Testing Library + `jsdom`, `fake-indexeddb`, Playwright (WebKit) |
| Qualità | ESLint (`typescript-eslint` strict) + Prettier |
| CI e hosting | GitHub Actions + GitHub Pages |

Le scelte principali:

- **PWA e non app nativa.** Si sviluppa solo da Windows, senza Mac, App Store o Apple Developer Program. Safari iOS copre quello che serve: modalità standalone, offline, IndexedDB, condivisione di file.
- **Router con `#`.** GitHub Pages non ha un fallback per le single-page app: con gli indirizzi del tipo `/gestione-spese/#/history` il server riceve sempre la stessa pagina e le pagine interne non danno mai 404.
- **Poche dipendenze.** Grafici, formattazione della valuta e traduzioni sono fatti a mano: pesano poco e non richiedono rete. Le regole per aggiungere una libreria sono in [`.claude/rules/dipendenze.md`](.claude/rules/dipendenze.md).

## Architettura

Le dipendenze vanno solo verso il basso:

```text
UI: pagine e componenti React           src/app, src/features/*, src/components
  ↓
Hook di dominio e store Zustand         src/features/*/use*.ts, src/stores
  ↓
Repository: unico accesso ai dati       src/data/repositories
  ↓
Dexie → IndexedDB                       src/data/db.ts
```

La logica pura (importi, date, filtri, aggregazioni, budget, backup, CSV, ricorrenti) sta in `src/domain`, senza import da React o Dexie, ed è testata in isolamento.

```text
src/
├── main.tsx          avvio: preferenze, operazioni iniziali, router
├── app/              router, layout con tab bar, toast, avviso di aggiornamento, tema
├── features/         home, expense, history, charts, settings, categories, recurring, install
├── components/       design system: Sheet, Chip, AmountText, ExpenseRow, Toggle…
├── domain/           logica pura e tipi
├── data/             schema Dexie, seed delle categorie, repository
├── i18n/             dizionari it/en, t(), lingua e locale attivi
├── stores/           preferenze (persistenti), stato UI, aggiornamenti
└── styles/           tokens.css, global.css
tests/e2e/            test Playwright su WebKit
scripts/              generazione delle icone PNG
docs/                 proposta, prototipo HTML, decisioni
```

Route: `#/`, `#/history`, `#/charts`, `#/settings`, `#/settings/categories`, `#/settings/recurring`.

## Dati

Il database IndexedDB si chiama `spese` e ha quattro tabelle:

| Tabella | Contenuto |
|---|---|
| `expenses` | importo, categoria, data, nota, metodo di pagamento, eventuale regola ricorrente |
| `categories` | nome (`null` = predefinita non rinominata, quindi tradotta), icona, colori chiaro/scuro, archiviata |
| `recurringRules` | spesa modello, giorno del mese, attiva, ultimo mese generato |
| `settings` | budget mensile |

Scelte che rendono i dati affidabili:

- **Importi in centesimi interi** (da 1 a 99.999.999): nessun errore di arrotondamento.
- **Date come stringhe locali `YYYY-MM-DD`**: niente fusi orari, e l'ordine alfabetico coincide con quello cronologico.
- **Nessun testo tradotto nel database**: cambiare lingua non tocca i dati.
- **Validazione nei repository**: importi, date future, limiti e categorie archiviate vengono rifiutati con errori tipizzati (`DataError`), che la UI traduce in messaggi.
- **Transazioni** per le operazioni composte (spesa + regola ricorrente, eliminazione di una regola, generazione delle ricorrenti).
- **Ricorrenti idempotenti**: all'avvio e a ogni ritorno in primo piano si creano le spese dei mesi dovuti e si aggiorna `lastGeneratedMonth`. Riaprire l'app non crea duplicati; il giorno 31 diventa l'ultimo giorno dei mesi più corti.
- **Schema versionato**: la versione 1 contiene già tutte le tabelle. Ogni modifica futura sarà una nuova versione con la sua migrazione (regole in [`.claude/rules/database.md`](.claude/rules/database.md)).

Le preferenze del dispositivo (tema, lingua, metodo di pagamento predefinito, data dell'ultimo backup) stanno in `localStorage` (`spese:prefs`). Vengono lette in modo sincrono all'avvio, così tema e lingua sono giusti fin dal primo frame, e non entrano nel backup.

Formato del backup:

```json
{ "app": "spese", "schemaVersion": 1, "exportedAt": "…", "categories": [], "expenses": [], "recurringRules": [], "settings": { "budgetCents": null } }
```

Il CSV esportato usa sempre il formato italiano (`;` come separatore, virgola decimale), qualunque sia la lingua dell'app.

## Offline, aggiornamenti e prestazioni

- Il service worker (Workbox) mette in **precache** tutti i file della build: dopo il primo caricamento l'app funziona senza rete.
- Gli aggiornamenti non ricaricano l'app da soli (`registerType: 'prompt'`): compare il toast "Nuova versione disponibile · Aggiorna". iOS tiene l'app sospesa anche per giorni, quindi l'app controlla se c'è una nuova versione a ogni ritorno in primo piano; il controllo si può avviare anche da Impostazioni.
- La Home è nel pacchetto iniziale. Storico, Grafici, Impostazioni, le funzioni di `motion` e lo schema `zod` del backup si caricano solo quando servono. L'obiettivo è restare **sotto i 200 KB compressi** di JavaScript iniziale.

## Sviluppo

Requisiti: **Node.js 24** (vedi `.nvmrc`) e npm.

```bash
npm install              # dipendenze
npm run dev              # dev server; con -- --host si apre dall'iPhone in rete locale
npm run build            # typecheck + build di produzione in dist/
npm run preview          # build servita su http://localhost:4173/gestione-spese/ (service worker attivo)
npm run typecheck        # tsc senza emissione
npm run lint             # ESLint, nessun warning ammesso
npm run format           # Prettier
npm test                 # Vitest
npm run test:e2e         # Playwright su WebKit (compila e avvia la preview da solo)
npm run check            # typecheck + lint + prettier --check + test
npm run icons            # rigenera le icone PNG in public/ con WebKit di Playwright
```

Per provare sull'iPhone senza pubblicare: `npm run dev -- --host`, poi apri in Safari l'indirizzo di rete locale mostrato nel terminale (PC e iPhone sulla stessa Wi-Fi). Il comportamento offline e gli aggiornamenti si verificano solo con `npm run preview` o sulla versione pubblicata.

La prima volta, per i test end-to-end serve il browser: `npx playwright install webkit`.

## Qualità e test

- **TypeScript strict** in tutto il progetto. La completezza dei dizionari IT/EN la garantisce il typecheck: una chiave mancante in una lingua non compila.
- **ESLint** con `typescript-eslint` strict, `react-hooks` e `react-refresh`, zero warning; **Prettier** con le impostazioni predefinite.
- **Vitest** per la logica di `src/domain`, i18n, store e repository. I test dei repository girano su IndexedDB simulato con `fake-indexeddb`. I test stanno accanto al file testato (`money.ts` → `money.test.ts`) e non usano mai la data reale.
- **Playwright su WebKit** (profilo iPhone 15), contro la build di produzione: inserimento, storico, filtri, grafici, budget, categorie, ricorrenti, backup, installazione, navigazione, PWA.

Cosa testare e cosa no: [`.claude/rules/test.md`](.claude/rules/test.md).

## CI e pubblicazione

Il workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) gira a ogni push su qualsiasi branch:

1. `npm ci`, typecheck, lint, `prettier --check`, test unitari;
2. test end-to-end su WebKit (in caso di errore carica tracce e screenshot come artifact);
3. build di produzione.

Solo sul branch `main`, e solo se tutti i controlli passano, la build viene pubblicata su **GitHub Pages**. Le modifiche che toccano solo documentazione (`docs/`, `.claude/`, file `.md`) non avviano il workflow.

Il repository è pubblico: backup ed esportazioni personali (`spese-backup-*.json`, `spese-*.csv`, `backup/`) sono esclusi in `.gitignore` e non vanno mai committati.

## Convenzioni

- Un branch per ogni fase della roadmap; si integra in `main` solo a fase completata, perché ogni push su `main` pubblica l'app.
- Commit in stile **Conventional Commits** in italiano: `feat(storico): raggruppa le spese per giorno`.
- Nomi nel codice (file, variabili, route, chiavi dei dizionari) in inglese; commenti, commit e documentazione in italiano. Fanno eccezione i valori già salvati nei dati (`spesa`, `trasporti`, `carta`, `contanti`…).
- Ogni testo visibile passa dai dizionari; importi e date si formattano con la lingua attiva (`it-IT` → `1.234,56 €`, `en-IE` → `€1,234.56`) e la settimana inizia sempre da lunedì.

Regole complete in [`.claude/rules/`](.claude/rules/) e contesto del progetto in [`CLAUDE.md`](CLAUDE.md).

## Stato

Versione **1.0.0**: MVP, filtri, grafici ed extra (ricorrenti, budget, categorie, suggerimenti, aggiornamenti) sono completi. Restano le rifiniture: test sull'iPhone, aree sicure, gesti, dark mode, accessibilità. I problemi trovati sull'iPhone si segnalano come issue su GitHub, una per problema.

## Documentazione

- [Proposta completa](docs/proposta-app-spese.md): design system, stack, GitHub Pages, database, piano di implementazione, rischi e decisioni
- [Prototipo HTML](docs/prototipo-app-spese.html): riferimento visivo dell'interfaccia
- [Punti aperti](docs/punti-aperti.md): decisioni prese durante l'analisi

## Licenza

[GNU GPL v3.0](LICENSE)
