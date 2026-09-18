---
paths:
  - "src/data/**/*.ts"
  - "src/domain/**/*.ts"
  - "src/features/**/use*.ts"
---

# Database (Dexie su IndexedDB)

## Accesso ai dati

- Importa `src/data/db.ts` solo dai file in `src/data/repositories`.
- Esponi alla UI solo funzioni dei repository e hook che le usano; non esporre tabelle Dexie.
- Usa `useLiveQuery` solo dentro hook in `src/features/**/use*.ts`, mai direttamente nei componenti.
- Esegui in una sola transazione (`db.transaction('rw', …)`) ogni operazione che scrive più record: import, seed, archiviazione con spese collegate.

## Importi

- Salva gli importi solo come `amountCents` intero positivo (massimo 99.999.999).
- Rifiuta nel repository importi non interi, negativi o nulli.
- Converti in euro solo per la visualizzazione e per l'export CSV.

## Date

- Salva la data della spesa come stringa locale `YYYY-MM-DD`; non salvare `Date` né timestamp per quel campo.
- Salva `createdAt` e `exportedAt` come stringa ISO 8601 completa.
- Calcola "oggi" con una funzione iniettabile, così i test non dipendono dalla data reale.
- Filtra per mese con intervalli di stringhe (`between('2026-09-01', '2026-09-31', true, true)`), non con `Date`.

## Schema e migrazioni

- Nome del database: `spese`.
- Definisci ogni versione con `db.version(n).stores({...})` e, se servono trasformazioni, `.upgrade(...)`.
- Non modificare mai una versione dello schema già pubblicata su `main`: aggiungi una versione nuova.
- Aggiungi per ogni `upgrade` un test che parta da dati della versione precedente.
- Dichiara un indice per ogni campo usato nei filtri: `date`, `categoryId` e l'indice composto `[categoryId+date]`.
- Incrementa `schemaVersion` del backup quando cambia il formato esportato.

## Query

- Usa le API indicizzate di Dexie (`where`, `between`, `anyOf`, `equals`) al posto di `toArray()` seguito da un filtro in memoria.
- Non costruire filtri o chiavi concatenando testo inserito dall'utente.
- Calcola aggregazioni (totali, per categoria, per giorno) in funzioni pure di `src/domain`, partendo dal risultato di una query per mese.

## Dati iniziali e regole di dominio

- Crea le categorie predefinite con id stabili (`spesa`, `trasporti`, `ristoranti`, `casa`, `salute`, `svago`, `abbonamenti`, `lavoro`, `altro`) in modo idempotente.
- Esegui il seed a ogni avvio e aggiungi solo le categorie predefinite mancanti, anche su database già popolati; non modificare quelle esistenti (nome, colore, archiviazione restano come li ha lasciati l'utente).
- Non aggiungere una categoria predefinita se esiste già una categoria con lo stesso nome in una delle lingue supportate (es. "Lavoro" o "Work", senza distinzione tra maiuscole e minuscole): l'utente l'ha già creata a mano.
- Ordina le categorie mostrando le predefinite nell'ordine dell'elenco sopra (`altro` ultima tra queste), seguite da quelle create dall'utente; una predefinita aggiunta dopo va comunque prima di `altro`.
- Non eliminare una categoria con spese: imposta `archived: true`.
- Non archiviare né eliminare la categoria `altro`.
- Rifiuta nomi di categoria duplicati, senza distinzione tra maiuscole e minuscole.

## Backup e persistenza

- Valida ogni file importato con `zod` prima di scrivere nel database.
- In modalità "Unisci" non duplicare spese con stessi `date`, `amountCents`, `categoryId` e `note`.
- In modalità "Sostituisci" svuota e riscrivi le tabelle nella stessa transazione.
- Richiedi `navigator.storage.persist()` all'avvio dell'app installata.
- Usa il prefisso `spese:` per ogni chiave di `localStorage`.
