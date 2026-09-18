# Spese — contesto del progetto

## Cos'è

- PWA per iPhone per registrare una spesa in euro in pochi secondi (3 tap + importo) e capire a colpo d'occhio quanto si spende: storico filtrabile e grafici mensili.
- Pubblico: **uso personale**, una persona, un iPhone, app aggiunta alla schermata Home da Safari.
- **Non è**: un gestionale finanziario, un'app con login o account, un servizio con backend o sincronizzazione, un'app collegata a banche o carte.

## Vincoli non negoziabili

- Nessun Mac: si sviluppa solo da Windows (Node.js 22, VS Code).
- PWA, non app nativa: niente App Store, niente Apple Developer Program, niente Expo né React Native.
- Vite + React + TypeScript in strict mode.
- Deve funzionare in Safari iOS installata sulla Home (`display-mode: standalone`); vietate le API non supportate da WebKit iOS.
- Dati solo sul dispositivo (IndexedDB), nessuna chiamata di rete a runtime, funzionamento offline completo.
- Interfaccia in **italiano (predefinito) e inglese**, scelta in Impostazioni; formati con la lingua attiva: `it-IT` (`1.234,56 €`, "mercoledì 16 settembre") o `en-IE` (`€1,234.56`, "Wednesday 16 September"); settimana sempre da lunedì. Regole in [`lingue.md`](.claude/rules/lingue.md).
- Importi come **centesimi interi**; data della spesa come stringa locale `YYYY-MM-DD`.
- Hosting GitHub Pages da repository **pubblico**: base `/spese/`, route con `#`, nessun dato personale nel repository.

## Stack e librerie

| Libreria | Uso |
|---|---|
| `vite` + `typescript` | Build e dev server |
| `react` + `react-dom` | Interfaccia |
| `vite-plugin-pwa` (Workbox) | Manifest, service worker, offline, avviso "Aggiorna" (`registerType: 'prompt'`) |
| `react-router` (`createHashRouter`) | Tab e pagine; filtri nella query dopo il `#` |
| `dexie` + `dexie-react-hooks` | IndexedDB, schema versionato, `useLiveQuery` |
| `zustand` (+ `persist`) | Stato UI e preferenze |
| `motion` | Fogli dal basso, swipe delle righe, transizioni |
| `date-fns` + locale `it` e `enIE` | Date e formati nella lingua attiva |
| `Intl.NumberFormat(<locale attivo>, { useGrouping: 'always' })` | Valuta e percentuali (`it-IT` / `en-IE`, nessuna libreria) |
| Dizionari tipizzati in `src/i18n` | Testi IT/EN con helper `t()` su misura (nessuna libreria i18n) |
| `lucide-react` | Icone |
| `zod` | Validazione del backup importato |
| CSS Modules + variabili CSS | Stili e token del design system (no framework CSS) |
| Componenti SVG su misura | Ciambella e barre giornaliere (nessuna libreria grafici) |
| `vitest` + Testing Library | Test unitari e di componenti |
| Playwright (WebKit) | Test end-to-end sul motore di Safari |
| ESLint + Prettier | Qualità del codice |
| GitHub Actions + GitHub Pages | Build e pubblicazione a ogni push su `main` |

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

Logica pura (importi, date, filtri, aggregazioni, backup) in `src/domain`, senza import da React o Dexie.

Albero previsto (bozza da confermare con la sezione 4 della proposta):

```text
gestione-spese/              radice del repository
├── .github/workflows/deploy.yml
├── public/                  apple-touch-icon.png, icons/
├── src/
│   ├── main.tsx
│   ├── app/                 router.tsx, AppLayout.tsx (tab bar, fogli, toast)
│   ├── features/            home/ spesa/ storico/ grafici/ impostazioni/ categorie/
│   ├── components/          componenti del design system (Sheet, Chip, AmountText…)
│   ├── domain/              money, dates, filters, aggregations, backup
│   ├── i18n/                it.ts, en.ts (dizionari), index.ts (t(), lingua attiva, locale)
│   ├── data/                db.ts, seed.ts, repositories/
│   ├── stores/              store Zustand
│   └── styles/              tokens.css, global.css
├── tests/e2e/               Playwright WebKit
├── index.html  vite.config.ts  tsconfig.json  package.json
```

## Modello dati (sintesi)

| Entità | Campi chiave |
|---|---|
| **Spesa** | `id`, `amountCents` (intero > 0, max 99.999.999), `categoryId`, `date` (`YYYY-MM-DD`), `note` (≤ 40 caratteri, opzionale), `paymentMethod` (`carta` \| `contanti` \| `altro`), `recurring` (mensile), `createdAt` (ISO 8601) |
| **Categoria** | `id` stabile, `name` (≤ 20, univoco senza distinzione maiuscole), `icon`, `colorLight`, `colorDark`, `builtin`, `archived` |
| **Budget** | Importo mensile globale in centesimi; assente o 0 = nessun budget |
| **Impostazioni** | Tema (`auto` \| `light` \| `dark`), lingua (`it` \| `en`, predefinita `it`), metodo di pagamento predefinito, data ultimo backup |

- Categorie predefinite (id stabili): Spesa, Trasporti, Ristoranti, Casa, Salute, Svago, Abbonamenti, Lavoro, Altro (`altro` non archiviabile, ultima tra le predefinite; seguono quelle create dall'utente). Il nome si traduce solo finché l'utente non lo rinomina; le categorie create dall'utente non si traducono mai.
- I dati salvati non dipendono dalla lingua (nessun testo tradotto nel database o nel backup).
- Categorie con spese: si archiviano, non si eliminano.
- Backup JSON: `{ app: 'spese', schemaVersion, exportedAt, categories[], expenses[] }`; CSV solo in esportazione (`;` e virgola decimale, sempre in formato italiano qualunque sia la lingua).
- Nome database `spese`; chiavi `localStorage` con prefisso `spese:`.
- Schema completo: sezione 3 della proposta (da completare).

## Funzionalità e roadmap

| Fase | Contenuto | Stato |
|---|---|---|
| Analisi e prototipo | Proposta, prototipo HTML (UI "iOS raffinato", lingua IT/EN) | fatto |
| 0. Setup | Progetto Vite/React/TS, PWA, token CSS, dizionari `src/i18n` e helper `t()`, tab bar, deploy GitHub Pages | da fare |
| 1. MVP | DB e seed categorie, inserimento con tastierino, storico per giorno, modifica/elimina con swipe e Annulla, guida installazione, backup esporta/importa, selettore lingua in Impostazioni | da fare |
| 2. Filtri | Foglio filtri (mese, categorie, giorno), mini-calendario, totale filtrato, filtri nell'URL | da fare |
| 3. Grafici | Ciambella per categoria, barre giornaliere, confronto con il mese precedente | da fare |
| 4. Extra | Spese ricorrenti, budget con proiezione, gestione categorie, avviso nuova versione, stato app | da fare |
| Rifiniture | Test su iPhone, aree sicure, gesti, dark mode, accessibilità | da fare |

Stati ammessi: `da fare` · `in corso` · `fatto`. Aggiornali a fine step (vedi `workflow-step.md`).

## Comandi

Disponibili dopo la fase 0 (script in `package.json`):

```bash
npm install              # dipendenze
npm run dev              # dev server; aggiungi -- --host per aprirlo dall'iPhone in rete locale
npm run build            # build di produzione in dist/
npm run preview          # build servita su http://localhost:4173/spese/ (service worker attivo)
npm run typecheck        # tsc senza emissione
npm run lint             # ESLint
npm test                 # Vitest
npm run test:e2e         # Playwright su WebKit
```

## Riferimenti

- Proposta completa: [`proposta-app-spese.md`](docs/proposta-app-spese.md) (design system § 1.5, stack § 2, GitHub Pages § 2.5, piano § 4.1, rischi e decisioni § 5)
- Prototipo di riferimento visivo (da implementare): [`prototipo-app-spese-v2.html`](docs/prototipo-app-spese-v2.html)
- Decisioni ancora da prendere: [`punti-aperti.md`](docs/punti-aperti.md)
- Regole operative: [`.claude/rules/`](.claude/rules/)
  - [`workflow-step.md`](.claude/rules/workflow-step.md): procedura di ogni step e Definition of Done
  - [`typescript-codice.md`](.claude/rules/typescript-codice.md) · [`database.md`](.claude/rules/database.md) · [`ui-design-system.md`](.claude/rules/ui-design-system.md)
  - [`lingue.md`](.claude/rules/lingue.md) · [`dipendenze.md`](.claude/rules/dipendenze.md) · [`test.md`](.claude/rules/test.md) · [`git.md`](.claude/rules/git.md)
- Decisioni ancora aperte: proposta § 5.4 (confermate D11, GitHub Pages, e D17, lingue IT/EN).
