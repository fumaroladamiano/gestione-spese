# Spese — Punti aperti da decidere

> ✅ **Tutti i punti sono risolti** (19 settembre 2026). Le decisioni sono riportate in `CLAUDE.md`, nelle regole di `.claude/rules/` e nella proposta (§ 3, § 4 e § 5.4). Decisioni aggiunte dopo le risposte: **Node.js 24** invece di 22 (B14); per i dettagli non specificati si segue il consiglio indicato. Questo file resta come storico delle scelte.

> Aggiornato al 18 settembre 2026. Raccoglie le decisioni non ancora prese su progetto, tecnologie, dati, comportamento, design e processo.
>
> **Come rispondere**: compila la riga **Risposta** di ogni punto.
> - `ok` = accetti il consiglio;
> - una lettera (`b`) = scegli un'altra opzione;
> - testo libero per varianti o dubbi.
>
> I codici tra parentesi (es. *D12*, *R5*) rimandano alla proposta [`proposta-app-spese.md`](proposta-app-spese.md). Dopo le risposte aggiornerò `CLAUDE.md`, le regole e la proposta.

## Già deciso (non serve rispondere)

| Tema | Decisione | Dove è scritta |
|---|---|---|
| Piattaforma | PWA installata dalla Home, niente app nativa né Expo | `CLAUDE.md`, proposta § 2.4 |
| Hosting | GitHub Pages con repository **pubblico** (*D11*) | proposta § 2.5, § 5.4 |
| Lingue | Italiano predefinito e inglese, scelta in Impostazioni, formati `it-IT` / `en-IE`, dizionari senza libreria (*D17*) | `.claude/rules/lingue.md` |
| Design | Direzione "iOS raffinato" del prototipo: palette, gradiente indaco, tipografia, raggi, icona dell'app (*D15* salvo il nome) | proposta § 1.5, `prototipo-app-spese-v2.html` |
| Categorie predefinite | 9, con **Lavoro**; "Altro" ultima tra le predefinite, poi quelle dell'utente; nomi tradotti solo se non rinominati | `CLAUDE.md`, `.claude/rules/database.md` |
| CSV | Sempre in formato italiano (`;`, virgola decimale), qualunque sia la lingua | `CLAUDE.md` |
| Radice del repository | `C:\AI Projects\gestione-spese\` è la radice del repository: il contenuto di `v2/` è stato spostato lì (A1) | `CLAUDE.md` |
| Materiale vecchio | Prima versione Expo, primo prototipo e presentazione eliminati | — |

## Indice

- [A. Struttura del progetto e repository](#a-struttura-del-progetto-e-repository)
- [B. Stack e tecnologie](#b-stack-e-tecnologie)
- [C. Modello dati](#c-modello-dati)
- [D. Comportamento dell'app](#d-comportamento-dellapp)
- [E. Design](#e-design)
- [F. Funzionalità e roadmap](#f-funzionalità-e-roadmap)
- [G. Processo di lavoro](#g-processo-di-lavoro)

---

## A. Struttura del progetto e repository

### A1 · Radice del repository GitHub

`CLAUDE.md` e `.claude/rules/` devono stare nella **radice** del repository, cioè la cartella da cui si apre la sessione di Claude Code: solo lì le regole vengono caricate con certezza.

- a) Il contenuto di `v2/` diventa la radice del repository; il livello `v2/` sparisce.
- b) Il repository contiene `v2/` come sottocartella: sconsigliato, perché GitHub Actions e il percorso `/spese/` diventano più complicati.

**Consiglio:** a)

**Risposta:** ok, con il contenuto di `v2/` direttamente sotto `C:\AI Projects\gestione-spese\` (fatto il 18 settembre 2026). La sessione di Claude Code va aperta da questa cartella.

---

### A2 · Dove tenere proposta, prototipo e punti aperti

- a) Nel repository, in una cartella `docs/`, rinominando il prototipo in `docs/prototipo-app-spese.html` (ora è l'unico, il suffisso `-v2` non serve più).
- b) Nel repository, nella radice accanto a `CLAUDE.md`, con i nomi attuali.
- c) Fuori dal repository (restano solo in locale).

Nota: il repository è pubblico, quindi i documenti sarebbero visibili a tutti (non contengono dati personali). Con a) aggiorno tutti i link in `CLAUDE.md`, regole e proposta.

**Consiglio:** a)

**Risposta:** a - è già così

---

### A3 · Nome del repository e indirizzo dell'app (*D16*, *R5*)

Il nome del repository su GitHub diventa parte dell'indirizzo (`https://<utente>.github.io/<nome>/`) e **non va più cambiato**: cambiarlo separa i dati sull'iPhone. Può essere diverso dal nome della cartella locale (`gestione-spese`), ma se coincidono è più semplice orientarsi.

- a) Repository `spese` → `https://<utente>.github.io/spese/`
- b) Repository `gestione-spese` → `https://<utente>.github.io/gestione-spese/`
- c) Altro nome (scrivilo)

**Consiglio:** a) — indirizzo più corto, già usato nelle bozze (`base: '/spese/'`).

**Risposta:** b

---

### A4 · Dominio personale

- a) Nessuno: indirizzo gratuito `github.io`
- b) Dominio personale (~10 €/anno), da configurare **prima** di iniziare a usare l'app

**Consiglio:** a)

**Risposta:** a

---

## B. Stack e tecnologie

### B1 · Conferma generale della proposta

Design e lingue sono già confermati. Resta da confermare il resto della proposta (flussi, stack, rischi) e che le sezioni 3 (schema del database) e 4 (implementazione) possono essere completate su questa base.

- a) Confermo la proposta
- b) Confermo con modifiche (indicale)

**Consiglio:** a)

**Risposta:** a

---

### B2 · Framework UI e build (*D13*)

- a) Vite + React + TypeScript
- b) Vite + Svelte + TypeScript
- c) TypeScript senza framework

**Consiglio:** a) — ecosistema ampio, molti esempi, tipizzazione di importi e date.

**Risposta:** a

---

### B3 · Database nel browser (*D12*)

- a) Dexie.js su IndexedDB
- b) SQLite WASM su OPFS

**Consiglio:** a) — più leggero e maturo su Safari; b) solo se servissero query SQL complesse.

**Risposta:** a

---

### B4 · Navigazione

- a) `react-router` con route basate su `#` (`/spese/#/storico`), necessario con GitHub Pages
- b) Nessun router: schermate gestite solo con stato interno (niente filtri nell'indirizzo)

**Consiglio:** a)

**Risposta:** a

---

### B5 · Stato dell'interfaccia e preferenze

Tra le preferenze ora c'è anche la lingua.

- a) `zustand` (con `persist` per le preferenze)
- b) Solo React (Context + `useState`)

**Consiglio:** a)

**Risposta:** a

---

### B6 · Animazioni, fogli e swipe

- a) `motion` (ex Framer Motion)
- b) Solo CSS e pointer events scritti a mano (come nel prototipo)

**Consiglio:** a) — trascinamento dei fogli e swipe più fluidi con meno codice.

**Risposta:** a

---

### B7 · Grafici (*D8*)

- a) Componenti SVG su misura (ciambella e barre)
- b) `recharts`

**Consiglio:** a)

**Risposta:** a

---

### B8 · Stili

- a) CSS Modules + variabili CSS per i token
- b) Tailwind CSS
- c) CSS-in-JS (es. styled-components)

**Consiglio:** a)

**Risposta:** a

---

### B9 · Icone

- a) `lucide-react`
- b) SVG propri come nel prototipo (nessuna libreria)

**Consiglio:** a)

**Risposta:** a

---

### B10 · Date e validazione

Con due lingue le date vanno formattate in italiano e in inglese. Il prototipo lo fa già solo con `Intl.DateTimeFormat`, senza librerie.

- **Date**: a) `date-fns` con locale `it` ed `enIE` (aritmetica delle date comoda, ~5–10 KB) · b) solo `Intl.DateTimeFormat` + poche funzioni proprie per mesi e giorni
- **Validazione del backup**: a) `zod` · b) controlli scritti a mano

**Consiglio:** a) per entrambi.

**Risposta date:** a

**Risposta validazione:** a

---

### B11 · PWA e aggiornamenti

- a) `vite-plugin-pwa` con aggiornamento su conferma ("Nuova versione disponibile · Aggiorna")
- b) `vite-plugin-pwa` con aggiornamento automatico silenzioso al riavvio

**Consiglio:** a) — evita di ricaricare l'app mentre si inserisce una spesa.

**Risposta:** a

---

### B12 · Strumenti di test

- **Unitari**: a) Vitest + Testing Library · b) solo Vitest (niente test di componenti)
- **End-to-end**: a) Playwright con motore WebKit (simile a Safari) · b) nessun test end-to-end
- **Repository in Node**: serve un IndexedDB simulato. a) `fake-indexeddb` (solo sviluppo, non finisce nell'app) · b) testare i repository solo con Playwright nel browser

**Consiglio:** a) per tutti e tre.

**Risposta unitari:** a

**Risposta end-to-end:** a

**Risposta IndexedDB simulato:** a

---

### B13 · Debug sull'iPhone

Senza Mac non si può usare il Web Inspector di Safari.

- a) `eruda` (console dentro la pagina) attivo **solo** in sviluppo
- b) Niente: si debugga solo sul PC con Playwright/WebKit

**Consiglio:** a)

**Risposta:** a

---

### B14 · Ambiente e qualità

- **Node.js**: a) 22 LTS · b) altra versione
- **Package manager**: a) npm · b) pnpm
- **Lint e formattazione**: a) ESLint (config React + TypeScript) + Prettier con impostazioni predefinite · b) solo ESLint
- **Controlli in GitHub Actions prima del deploy**: a) typecheck, lint e test devono passare, altrimenti niente pubblicazione · b) solo build e pubblicazione (come nella bozza attuale)

**Consiglio:** a) per tutti.

**Risposta Node:** a

**Risposta package manager:** a

**Risposta lint:** a

**Risposta controlli CI:** a

---

## C. Modello dati

### C1 · Budget

Nel prototipo il budget è un'impostazione (un solo importo); non è deciso se debba diventare una tabella, per esempio per avere uno storico dei budget mensili.

- a) Impostazione unica: un importo valido per tutti i mesi
- b) Tabella `budget` per mese (`2026-09` → importo), con il valore del mese precedente come predefinito

**Consiglio:** a) nell'MVP; b) solo se vuoi budget diversi per mese.

**Risposta:** a

---

### C2 · Spese ricorrenti (*D3*, *R14*)

- a) **Regola** separata (importo, categoria, nota, giorno del mese, attiva/sospesa) che genera ogni mese una spesa normale all'apertura dell'app, senza duplicati
- b) **Promemoria**: all'apertura propone "Registrare Netflix 12,99 €?" da confermare
- c) Solo un'**etichetta** ↻ sulla spesa, senza generazione automatica (come nel prototipo)

**Consiglio:** a)

**Risposta:** a

---

### C3 · Come salvare l'icona della categoria

La proposta salva il nome Lucide (`ShoppingCart`, `Briefcase`), il prototipo usa nomi propri (`cart`, `briefcase`).

- a) Nomi propri stabili (`cart`, `car`, `food`, `briefcase`…) mappati alle icone nel codice: se cambia libreria i dati e i backup restano validi
- b) Nome Lucide diretto (`ShoppingCart`)

**Consiglio:** a)

**Risposta:** a

---

### C4 · Icona della categoria Salute

- a) Cuore (come nel prototipo)
- b) Cuore con battito, `HeartPulse` (come nella proposta)
- c) Croce/cassetta medica

**Consiglio:** b)

**Risposta:** voglio quello del prototipo

---

### C5 · Categorie predefinite mai usate *(nuovo)*

Il seed aggiunge a ogni avvio le categorie predefinite mancanti (serve per far arrivare "Lavoro" a chi ha già dati). Se una predefinita si potesse eliminare, al riavvio ricomparirebbe.

- a) Le predefinite non si eliminano mai: si possono solo rinominare, ricolorare e archiviare (come nel prototipo)
- b) Si possono eliminare se non hanno spese; il seed ricorda quelle eliminate e non le ricrea (serve un elenco in più nelle impostazioni)

**Consiglio:** a) — più semplice, e archiviare una categoria la toglie comunque da inserimento e filtri.

**Risposta:** a

---

### C6 · Limiti

Con Lavoro le predefinite sono 9: con il limite di 15 restano 6 categorie personalizzate attive (le archiviate non contano).

| Limite | Valore proposto |
|---|---|
| Importo massimo | 999.999,99 € |
| Nota | 40 caratteri |
| Nome categoria | 20 caratteri |
| Categorie attive | massimo 15 |

- a) Confermo tutti
- b) Modifico (indica quali, es. 20 categorie attive)

**Consiglio:** a) — con più di 16 categorie la griglia di inserimento supera le 4 righe e spinge il tastierino in basso.

**Risposta:** a

---

### C7 · Campi tecnici della spesa

- a) `createdAt` e `updatedAt` (utili per ordinare le spese dello stesso giorno e per l'unione dei backup)
- b) Solo `createdAt`

**Consiglio:** a)

**Risposta:** a

---

### C8 · Metodo di pagamento

Senza report dedicati aggiunge poco valore.

- a) Tenerlo opzionale (chip con valore predefinito), senza grafici
- b) Toglierlo

**Consiglio:** a)

**Risposta:** a

---

## D. Comportamento dell'app

### D1 · Pulsante "Aggiungi" (*D1*)

- a) Tab centrale "+" (come nel prototipo)
- b) Pulsante "+" in alto in Home e Storico
- c) Pulsante flottante

**Consiglio:** a)

**Risposta:** a

---

### D2 · Inserimento dell'importo (*D2*)

- a) Tastierino integrato nell'app
- b) Tastiera numerica di iOS

**Consiglio:** a)

**Risposta:** a

---

### D3 · Categoria preselezionata (*D4*)

- a) Nessuna: si sceglie sempre (3 tap)
- b) Ultima usata (2 tap, rischio di errori)

**Consiglio:** a)

**Risposta:** a

---

### D4 · Date future (*D5*)

- a) Non ammesse
- b) Ammesse (spese programmate)

**Consiglio:** a)

**Risposta:** a

---

### D5 · Confronto con il mese precedente (*D6*)

- a) Mese in corso confrontato con lo stesso periodo del mese precedente; mesi chiusi confrontati per intero
- b) Sempre mese intero

**Consiglio:** a)

**Risposta:** a

---

### D6 · Budget per categoria (*D7*)

- a) Solo budget mensile globale
- b) Anche budget per categoria

**Consiglio:** a) — b) eventualmente dopo la fase 4.

**Risposta:** a

---

### D7 · Formati di backup (*D9*)

- a) JSON in esportazione e importazione + CSV solo in esportazione (per Excel)
- b) Solo JSON
- c) Anche importazione da CSV

**Consiglio:** a)

**Risposta:** a

---

### D8 · Categorie con spese (*D10*)

- a) Si archiviano (spariscono da inserimento e filtri, restano nello storico)
- b) Si eliminano spostando le spese in "Altro"
- c) Non si possono né eliminare né archiviare

**Consiglio:** a)

**Risposta:** a

---

### D9 · Importazione "Unisci"

Quando due spese si considerano la stessa (e quindi non vengono duplicate)?

- a) Stessa data, importo, categoria e nota
- b) Mai: "Unisci" aggiunge sempre tutto
- c) Nessuna modalità "Unisci", solo "Sostituisci tutto"

**Consiglio:** a)

**Risposta:** a

---

### D10 · Filtri dello storico al riavvio

- a) Restano nell'indirizzo: se iOS chiude l'app, riaprendola la vista filtrata viene ripristinata
- b) Si torna sempre al mese corrente senza filtri

**Consiglio:** a)

**Risposta:** a

---

### D11 · Guida all'installazione

- a) Si apre da sola al primo accesso da Safari, poi resta un banner in Home finché l'app non è installata
- b) Solo banner, niente apertura automatica

**Consiglio:** a)

**Risposta:** a

---

### D12 · Uso su altri dispositivi (*D14*)

- a) Best effort: funziona anche su PC e Android, ma si testa solo su iPhone; dati separati per dispositivo
- b) Supportato e testato anche su altri dispositivi

**Consiglio:** a)

**Risposta:** a

---

## E. Design

### E1 · Nome dell'app (*D15*)

Icona (portafoglio bianco su gradiente indaco) e colore d'accento sono definiti dal design system. Resta il nome, che compare sotto l'icona sulla Home (massimo ~12 caratteri) ed è lo stesso in italiano e in inglese.

- a) Spese
- b) Altro (scrivilo)

**Consiglio:** a)

**Risposta:** a

---

### E2 · Tema predefinito

- a) Automatico (segue il tema dell'iPhone), con scelta manuale in Impostazioni (come nel prototipo)
- b) Sempre chiaro
- c) Sempre scuro

**Consiglio:** a)

**Risposta:** a

---

## F. Funzionalità e roadmap

### F1 · Ricerca testuale nelle note ("Esselunga")

- a) Nella fase 2 (filtri)
- b) Nella fase 4 (extra)
- c) Non prevista

**Consiglio:** a)

**Risposta:** a

---

### F2 · Suggerimento della categoria dalla nota già usata

- a) Fase 4 (extra)
- b) Non prevista

**Consiglio:** a)

**Risposta:** a

---

### F3 · Promemoria giornaliero

Una PWA senza server non può inviare notifiche.

- a) Fuori dall'app: promemoria ricorrente nell'app Promemoria di iOS con il link all'app
- b) Non previsto

**Consiglio:** a) (non richiede sviluppo)

**Risposta:** a

---

### F4 · Funzioni escluse

Conferma che restano **fuori** dal progetto:

- Blocco con Face ID
- Spese in valuta estera
- Widget, Siri e Comandi rapidi
- Sincronizzazione tra dispositivi
- Collegamento a banche, carte o Apple Pay
- Entrate (l'app registra solo uscite)
- Lingue oltre a italiano e inglese

- a) Confermo tutte escluse
- b) Voglio reintegrarne qualcuna (indica quali)

**Consiglio:** a)

**Risposta:** a

---

### F5 · Contenuto delle fasi

La roadmap di `CLAUDE.md` prevede:

| Fase | Contenuto |
|---|---|
| 0. Setup | Progetto, PWA, token CSS, dizionari IT/EN, tab bar, deploy su GitHub Pages |
| 1. MVP | Database e categorie, inserimento, storico, modifica/elimina con Annulla, guida installazione, backup, selettore lingua |
| 2. Filtri | Foglio filtri, calendario, totale filtrato, filtri nell'indirizzo |
| 3. Grafici | Ciambella, barre giornaliere, confronto |
| 4. Extra | Ricorrenti, budget, gestione categorie, avviso nuova versione, stato app |
| Rifiniture | Test su iPhone, dettagli visivi, accessibilità |

Nel prototipo la card del mese in Home mostra già il budget, e la gestione categorie è visibile, ma qui arrivano solo nella fase 4: fino ad allora la Home mostra il totale senza barra del budget.

- a) Confermo la suddivisione
- b) Sposto budget e/o gestione categorie nell'MVP
- c) Altre modifiche (indicale)

**Consiglio:** a) — l'MVP resta piccolo e usabile prima.

**Risposta:** a

---

### F6 · Ordinamento manuale delle categorie *(nuovo)*

L'ordine è deciso (predefinite fisse, poi quelle dell'utente per data di creazione). Resta da capire se serve poterlo cambiare.

- a) Trascinando le righe in Impostazioni → Categorie, nella fase 4 o dopo
- b) Non previsto

**Consiglio:** b) — con 9 categorie fisse in ordine logico il guadagno è piccolo; si può riaprire dopo l'uso reale.

**Risposta:** b

---

## G. Processo di lavoro

### G1 · Lingua dei nomi nel codice

Già deciso che le chiavi dei dizionari dei testi sono in inglese (`addExpense`, `filteredTotal`).

- a) Misto come nelle bozze: cartelle e pagine in italiano (`storico`, `StoricoPage`), dati e funzioni in inglese (`amountCents`, `getMonthTotal`)
- b) Tutto in inglese nel codice (`history`, `HistoryPage`); italiano solo per commenti e commit
- c) Tutto in italiano (`importoCentesimi`, `totaleMese`)

**Consiglio:** b) — più coerente con librerie, esempi e chiavi dei dizionari; con a) si mescolano due lingue.

**Risposta:** b

---

### G2 · Branch e integrazione

- a) Un branch per fase (`fase-1-mvp`…), unito in `main` a fase completata (ogni unione pubblica l'app)
- b) Un branch per step, unito in `main` a ogni step (pubblicazioni più frequenti)
- c) Tutto direttamente su `main`

**Consiglio:** a) — l'app sull'iPhone cambia solo a fasi concluse.

**Risposta:** a

---

### G3 · Commit

- a) Un commit per step, creato da me dopo la tua conferma, in Conventional Commits in italiano
- b) Commit creati sempre da te
- c) Più commit per step, se utili

**Consiglio:** a)

**Risposta:** un commit per stet, lo crei tu con titolo e descrizione in italiano, e lo committi e pushi tu, ti autorizzo

---

### G4 · Unione in `main` e push

- a) Unione e `git push` su `main` solo dopo tua conferma esplicita
- b) Li fai sempre tu

**Consiglio:** a)

**Risposta:** gestisci tu le unioni, ovviamente prima di farlo assicurati che sia safe, ti autorizzo

---

### G5 · Raccolta del feedback dai test sull'iPhone

- a) Issue su GitHub (una per problema)
- b) Elenco in un file `feedback.md` nel repository
- c) Direttamente in chat

**Consiglio:** a) — nota: il repository è pubblico, quindi le issue sono visibili.

**Risposta:** a

---

### G6 · Completamento della documentazione

Le sezioni 3 (Database) e 4 (Implementazione) della proposta sono ancora da scrivere.

- a) Le completo subito dopo le tue risposte, prima della fase 0
- b) Si parte con la fase 0 e le sezioni si completano durante lo sviluppo

**Consiglio:** a)

**Risposta:** a

---

### G7 · Prova del prototipo sull'iPhone prima del setup *(nuovo)*

Il prototipo è stato verificato solo su Chromium dal PC, non in Safari su iPhone: è il momento più economico per trovare problemi di aspetto o di gesti.

- a) Lo pubblico come pagina privata (Artifact di claude.ai) e lo apri da Safari sull'iPhone, anche aggiunto alla Home
- b) Lo provi dopo la fase 0, caricandolo su GitHub Pages insieme all'app
- c) Nessuna prova sul prototipo: si prova direttamente l'app

**Consiglio:** a) — richiede pochi minuti e non dipende dal repository.

**Risposta:** a — provato su iPhone il 19 settembre 2026: ok, nessuna modifica.
