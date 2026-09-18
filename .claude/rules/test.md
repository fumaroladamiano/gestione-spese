---
paths:
  - "src/**/*.{ts,tsx}"
  - "tests/**/*.ts"
---

# Test

## Test unitari obbligatori (Vitest)

- **Importi** (`src/domain/money`): input del tastierino in centesimi (separatore doppio, terzo decimale, massimo 6 cifre intere), formattazione con separatore delle migliaia in `it-IT` (`1.500 €`, `1.234,56 €`) e in `en-IE` (`€1,500.00`, `€1,234.56`), lettura di importi digitati in entrambi i formati (`1.234,50` / `1,234.50`).
- **Date** (`src/domain/dates`): etichette "Oggi"/"Ieri" e "Today"/"Yesterday", nomi di giorni e mesi in entrambe le lingue, inizio e fine mese, anni bisestili, settimana da lunedì anche in inglese, mese precedente.
- **Lingue** (`src/i18n`): lingua mancante o non valida → `it`; plurali (1 spesa / 2 spese, 1 expense / 2 expenses); nome tradotto per le categorie predefinite non rinominate, nome originale per quelle rinominate o create dall'utente. La completezza dei dizionari la garantisce il `typecheck`, non un test.
- **Filtri** (`src/domain/filters`): AND tra mese, categorie e giorno; OR tra più categorie; il giorno imposta il mese; cambio di mese che azzera il giorno.
- **Aggregazioni** (`src/domain/aggregations`): totale del mese, totale per categoria e percentuali, totali giornalieri, media giornaliera, confronto sullo stesso periodo per il mese in corso e sul mese intero per quelli chiusi, proiezione del budget.
- **Backup** (`src/domain/backup`): validazione di file validi e non validi, "Unisci" senza duplicati, "Sostituisci", CSV con `;` e virgola decimale anche con l'app in inglese.
- **Repository** (`src/data/repositories`): inserimento, modifica, eliminazione, archiviazione delle categorie, rifiuto di importi non validi, seed idempotente, ogni `upgrade` dello schema.
- **Ricorrenti** (fase 4): generazione idempotente, nessun duplicato riaprendo l'app più volte.

## Test end-to-end (Playwright, WebKit)

- Aggiungere una spesa in 3 tap (+, categoria, Salva) con importo digitato.
- Filtrare lo storico per categoria e mese e verificare il totale.
- Eliminare una spesa con swipe e ripristinarla con "Annulla".
- Esportare e reimportare un backup.
- Cambiare lingua in Impostazioni e verificare testi, importi e date della Home in inglese; la scelta resta dopo il ricaricamento.

## Cosa non testare

- Aspetto grafico, colori e dimensioni in pixel.
- Componenti puramente presentazionali senza logica.
- Il comportamento interno di Dexie, date-fns, React o altre librerie.
- Snapshot di interi alberi di componenti.

## Come scrivere i test

- Metti i test unitari accanto al file testato: `money.ts` → `money.test.ts`.
- Scrivi i nomi dei test in italiano e descrivi il comportamento atteso.
- Non usare la data reale: passa "oggi" come parametro o usa un orologio simulato.
- Esprimi gli importi nei test in centesimi interi.
- Per ogni bug corretto, aggiungi prima un test che lo riproduce.
- Non lasciare `it.only`, `describe.only` o test saltati senza motivazione.
