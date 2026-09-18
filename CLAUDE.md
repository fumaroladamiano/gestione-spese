# Spese — contesto del progetto

## Cos'è

- PWA per iPhone per registrare una spesa in euro in pochi secondi (3 tap + importo) e capire a colpo d'occhio quanto si spende: storico filtrabile e grafici mensili.
- Pubblico: **uso personale**, una persona, un iPhone, app aggiunta alla schermata Home da Safari. Su PC e Android funziona "best effort" (non testata, dati separati per dispositivo).
- **Non è**: un gestionale finanziario, un'app con login o account, un servizio con backend o sincronizzazione, un'app collegata a banche o carte.
- **Fuori scopo**: Face ID, valute estere, widget/Siri/Comandi rapidi, sincronizzazione, banche/Apple Pay, entrate, lingue oltre IT/EN, notifiche (promemoria solo nell'app Promemoria di iOS).

## Vincoli non negoziabili

- Nessun Mac: si sviluppa solo da Windows (Node.js 24, npm, VS Code).
- PWA, non app nativa: niente App Store, niente Apple Developer Program, niente Expo né React Native.
- Vite + React + TypeScript in strict mode.
- Deve funzionare in Safari iOS installata sulla Home (`display-mode: standalone`); vietate le API non supportate da WebKit iOS.
- Dati solo sul dispositivo (IndexedDB), nessuna chiamata di rete a runtime, funzionamento offline completo.
- Interfaccia in **italiano (predefinito) e inglese**, scelta in Impostazioni; formati con la lingua attiva: `it-IT` (`1.234,56 €`, "mercoledì 16 settembre") o `en-IE` (`€1,234.56`, "Wednesday 16 September"); settimana sempre da lunedì. Regole in [`lingue.md`](.claude/rules/lingue.md).
- Importi come **centesimi interi**; data della spesa come stringa locale `YYYY-MM-DD`; date future non ammesse.
- Hosting GitHub Pages dal repository **pubblico** `fumaroladamiano/gestione-spese`: indirizzo `https://fumaroladamiano.github.io/gestione-spese/`, base `/gestione-spese/`, route con `#`, nessun dato personale nel repository. Il nome del repository non si cambia più.
- Nome dell'app sulla Home: **Spese** (uguale in entrambe le lingue).
- Nomi nel codice (cartelle, file, route, variabili, chiavi dei dizionari) **in inglese**; italiano solo in commenti, commit e documentazione. Eccezione: i valori già salvati nei dati (id categorie `spesa`, `trasporti`…, metodi `carta` | `contanti` | `altro`).

## Stack e librerie

| Libreria | Uso |
|---|---|
| `vite` + `typescript` | Build e dev server |
| `react` + `react-dom` | Interfaccia |
| `vite-plugin-pwa` (Workbox) | Manifest, service worker, offline, avviso "Aggiorna" (`registerType: 'prompt'`) |
| `react-router` (`createHashRouter`) | Tab e pagine; filtri nella query dopo il `#` |
| `dexie` + `dexie-react-hooks` | IndexedDB, schema versionato, `useLiveQuery` |
| `zustand` (+ `persist`) | Stato UI e preferenze del dispositivo |
| `motion` | Fogli dal basso, swipe delle righe, transizioni |
| `date-fns` + locale `it` e `enIE` | Date e formati nella lingua attiva |
| `Intl.NumberFormat(<locale attivo>, { useGrouping: 'always' })` | Valuta e percentuali (`it-IT` / `en-IE`, nessuna libreria) |
| Dizionari tipizzati in `src/i18n` | Testi IT/EN con helper `t()` su misura (nessuna libreria i18n) |
| `lucide-react` | Icone |
| `zod` | Validazione del backup importato e dei parametri dell'URL |
| CSS Modules + variabili CSS | Stili e token del design system (no framework CSS) |
| Componenti SVG su misura | Ciambella e barre giornaliere (nessuna libreria grafici) |
| `vitest` + Testing Library | Test unitari e di componenti |
| `fake-indexeddb` (solo sviluppo) | IndexedDB simulato per testare i repository in Node |
| Playwright (WebKit) | Test end-to-end sul motore di Safari |
| `eruda` (solo sviluppo) | Console dentro la pagina per il debug sull'iPhone; mai nella build di produzione |
| ESLint + Prettier | Qualità del codice |
| GitHub Actions + GitHub Pages | Controlli su ogni push; pubblicazione a ogni push su `main` solo se i controlli passano |

## Architettura

Dipendenze solo verso il basso:

```text
UI: pagine e componenti React            src/app, src/features/*, src/components
  ↓
Hook e stato: hook di dominio, Zustand   src/features/*/use*.ts, src/stores
  ↓
Repository: unico accesso ai dati        src/data/repositories
  ↓
Dexie → IndexedDB sul dispositivo        src/data/db.ts
```

Logica pura (importi, date, filtri, aggregazioni, backup, ricorrenti) in `src/domain`, senza import da React o Dexie.

Albero delle cartelle (dettaglio nella proposta § 4.3):

```text
gestione-spese/              radice del repository
├── .github/workflows/ci.yml controlli su ogni push, deploy da main
├── docs/                    proposta, prototipo, punti aperti
├── public/                  apple-touch-icon.png, icons/
├── src/
│   ├── main.tsx
│   ├── app/                 router.tsx, AppLayout.tsx (tab bar, fogli, toast)
│   ├── features/            home/ expense/ history/ charts/ settings/ categories/ install/ recurring/
│   ├── components/          componenti del design system (Sheet, Chip, AmountText…)
│   ├── domain/              money, dates, filters, aggregations, backup, csv, recurring, categories, ids
│   ├── i18n/                it.ts, en.ts (dizionari), index.ts (t(), lingua attiva, locale)
│   ├── data/                db.ts, seed.ts, repositories/
│   ├── stores/              store Zustand (preferenze, stato UI)
│   └── styles/              tokens.css, global.css
├── tests/e2e/               Playwright WebKit
├── index.html  vite.config.ts  tsconfig.json  package.json  .nvmrc
```

Route: `#/`, `#/history`, `#/charts`, `#/settings`, `#/settings/categories`, `#/settings/recurring`. Filtri dello storico nella query: `#/history?month=2026-09&cat=spesa,casa&day=2026-09-16&q=esselunga` (`month=all` per tutti i mesi).

## Modello dati (sintesi)

Schema completo: proposta § 3.

| Dove | Contenuto |
|---|---|
| Tabella **`expenses`** | `id` (stringa casuale), `amountCents` (intero 1–99.999.999), `categoryId`, `date` (`YYYY-MM-DD`), `note` (≤ 40, stringa vuota se assente), `paymentMethod` (`carta` \| `contanti` \| `altro`), `recurringRuleId` (assente se non ricorrente), `createdAt`, `updatedAt` (ISO 8601) |
| Tabella **`categories`** | `id` stabile, `name` (≤ 20, univoco senza maiuscole; `null` = predefinita non rinominata, nome tradotto), `icon` (nome proprio: `cart`, `heart`…), `colorLight`, `colorDark`, `builtin`, `archived`, `createdAt` |
| Tabella **`recurringRules`** | `id`, `amountCents`, `categoryId`, `note`, `paymentMethod`, `dayOfMonth` (1–31), `active`, `lastGeneratedMonth` (`YYYY-MM`), `createdAt`, `updatedAt` |
| Tabella **`settings`** (chiave-valore) | `budgetCents`: budget mensile globale unico (assente = nessun budget) |
| `localStorage` `spese:prefs` (Zustand `persist`) | Tema (`auto` \| `light` \| `dark`), lingua (`it` \| `en`, predefinita `it`), metodo di pagamento predefinito, data ultimo backup, guida installazione già vista |

- Categorie predefinite (id stabili): Spesa, Trasporti, Ristoranti, Casa, Salute, Svago, Abbonamenti, Lavoro, Altro (`altro` non archiviabile, ultima tra le predefinite; seguono quelle create dall'utente in ordine di creazione, senza riordino manuale). Le predefinite non si eliminano: si rinominano, ricolorano, archiviano. Il nome si traduce solo finché l'utente non lo rinomina; le categorie create dall'utente non si traducono mai.
- Limiti: importo max 999.999,99 €, nota 40 caratteri, nome categoria 20, massimo 15 categorie attive.
- Categorie con spese: si archiviano, non si eliminano (una personalizzata senza spese si elimina).
- Spese ricorrenti: una **regola** mensile genera all'apertura dell'app una spesa normale per ogni mese dovuto, in modo idempotente (`lastGeneratedMonth`).
- I dati salvati non dipendono dalla lingua (nessun testo tradotto nel database o nel backup).
- Backup JSON: `{ app: 'spese', schemaVersion: 1, exportedAt, categories[], expenses[], recurringRules[], settings }`; importazione "Sostituisci tutto" o "Unisci" (spesa uguale = stessi `date`, `amountCents`, `categoryId`, `note`). CSV solo in esportazione (`;` e virgola decimale, sempre in formato italiano qualunque sia la lingua).
- Nome database `spese`; chiavi `localStorage` con prefisso `spese:`.

## Funzionalità e roadmap

| Fase | Contenuto | Stato |
|---|---|---|
| Analisi e prototipo | Proposta, prototipo HTML (UI "iOS raffinato", lingua IT/EN), punti aperti risolti | fatto |
| 0. Setup | Progetto Vite/React/TS, PWA, token CSS, dizionari `src/i18n` e helper `t()`, tab bar, CI e deploy GitHub Pages | da fare |
| 1. MVP | DB e seed categorie, inserimento con tastierino, storico per giorno, modifica/elimina con swipe e Annulla, guida installazione, backup esporta/importa, selettore lingua e tema in Impostazioni | da fare |
| 2. Filtri | Foglio filtri (mese, categorie, giorno), mini-calendario, ricerca nelle note, totale filtrato, filtri nell'URL | da fare |
| 3. Grafici | Ciambella per categoria, barre giornaliere, confronto con il mese precedente | da fare |
| 4. Extra | Spese ricorrenti, budget con proiezione, gestione categorie, suggerimento categoria dalla nota, avviso nuova versione, stato app | da fare |
| Rifiniture | Test su iPhone, aree sicure, gesti, dark mode, accessibilità | da fare |

Stati ammessi: `da fare` · `in corso` · `fatto`. Aggiornali a fine step (vedi `workflow-step.md`). Step e criteri di completamento di ogni fase: proposta § 4.4.

## Comandi

Disponibili dopo la fase 0 (script in `package.json`):

```bash
npm install              # dipendenze
npm run dev              # dev server; aggiungi -- --host per aprirlo dall'iPhone in rete locale
npm run build            # build di produzione in dist/
npm run preview          # build servita su http://localhost:4173/gestione-spese/ (service worker attivo)
npm run typecheck        # tsc senza emissione
npm run lint             # ESLint
npm test                 # Vitest
npm run test:e2e         # Playwright su WebKit
```

## Riferimenti

- Proposta completa: [`proposta-app-spese.md`](docs/proposta-app-spese.md) (design system § 1.5, stack § 2, GitHub Pages § 2.5, database § 3, implementazione § 4, rischi e decisioni § 5)
- Prototipo di riferimento visivo (da implementare): [`prototipo-app-spese.html`](docs/prototipo-app-spese.html)
- Decisioni prese: [`punti-aperti.md`](docs/punti-aperti.md) (tutti risolti) e proposta § 5.4
- Feedback dai test sull'iPhone: issue su GitHub, una per problema
- Regole operative: [`.claude/rules/`](.claude/rules/)
  - [`workflow-step.md`](.claude/rules/workflow-step.md): procedura di ogni step e Definition of Done
  - [`typescript-codice.md`](.claude/rules/typescript-codice.md) · [`database.md`](.claude/rules/database.md) · [`ui-design-system.md`](.claude/rules/ui-design-system.md)
  - [`lingue.md`](.claude/rules/lingue.md) · [`dipendenze.md`](.claude/rules/dipendenze.md) · [`test.md`](.claude/rules/test.md) · [`git.md`](.claude/rules/git.md)
