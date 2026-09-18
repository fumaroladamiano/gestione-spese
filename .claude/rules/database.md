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
- Salva `createdAt`, `updatedAt` ed `exportedAt` come stringa ISO 8601 completa; aggiorna `updatedAt` a ogni modifica.
- Non accettare date future per le spese create dall'utente (in inserimento e in modifica).
- Calcola "oggi" con una funzione iniettabile, così i test non dipendono dalla data reale.
- Filtra per mese con intervalli di stringhe (`between('2026-09-01', '2026-09-31', true, true)`), non con `Date`.

## Schema e migrazioni

- Nome del database: `spese`. Tabelle: `expenses`, `categories`, `recurringRules`, `settings` (schema completo nella proposta § 3).
- La versione 1 dello schema contiene già tutte e quattro le tabelle, anche quelle usate solo dalla fase 4.
- Genera gli id con `newId()` di `src/domain/ids.ts` (basato su `crypto.getRandomValues`); non usare `crypto.randomUUID()`, che manca sull'iPhone in rete locale (`http`, contesto non sicuro).
- Definisci ogni versione con `db.version(n).stores({...})` e, se servono trasformazioni, `.upgrade(...)`.
- Non modificare mai una versione dello schema già pubblicata su `main`: aggiungi una versione nuova.
- Aggiungi per ogni `upgrade` un test che parta da dati della versione precedente.
- Dichiara un indice per ogni campo usato nei filtri: `date`, `categoryId`, `recurringRuleId` e gli indici composti `[categoryId+date]` e `[date+createdAt]` (ordinamento delle liste).
- IndexedDB non indicizza booleani né `null`: non indicizzare `archived` o `active`, e lascia assente (non `null`) `recurringRuleId` delle spese non ricorrenti.
- Incrementa `schemaVersion` del backup quando cambia il formato esportato.

## Query

- Usa le API indicizzate di Dexie (`where`, `between`, `anyOf`, `equals`) al posto di `toArray()` seguito da un filtro in memoria.
- Eccezioni ammesse: `categories`, `recurringRules` e `settings` si leggono per intero (poche decine di record); la ricerca nelle note filtra in memoria il risultato della query per mese (o di tutte le spese con "Tutti i mesi").
- Non costruire filtri o chiavi concatenando testo inserito dall'utente.
- Calcola aggregazioni (totali, per categoria, per giorno) in funzioni pure di `src/domain`, partendo dal risultato di una query per mese.

## Dati iniziali e regole di dominio

- Crea le categorie predefinite con id stabili (`spesa`, `trasporti`, `ristoranti`, `casa`, `salute`, `svago`, `abbonamenti`, `lavoro`, `altro`) in modo idempotente.
- Esegui il seed a ogni avvio e aggiungi solo le categorie predefinite mancanti, anche su database già popolati; non modificare quelle esistenti (nome, colore, archiviazione restano come li ha lasciati l'utente).
- Non aggiungere una categoria predefinita se esiste già una categoria con lo stesso nome in una delle lingue supportate (es. "Lavoro" o "Work", senza distinzione tra maiuscole e minuscole): l'utente l'ha già creata a mano.
- Ordina le categorie mostrando le predefinite nell'ordine dell'elenco sopra (`altro` ultima tra queste), seguite da quelle create dall'utente; una predefinita aggiunta dopo va comunque prima di `altro`.
- Salva `name: null` per le predefinite non rinominate (il nome mostrato viene dai dizionari).
- Salva l'icona con il nome proprio stabile (`cart`, `car`, `food`, `home`, `heart`, `star`, `repeat`, `dots`, `gift`, `plane`, `book`, `dumbbell`, `shirt`, `coffee`, `briefcase`), mai il nome del componente Lucide.
- Non eliminare mai una categoria predefinita: si rinomina, si ricolora o si archivia.
- Non eliminare una categoria con spese: imposta `archived: true`. Una categoria personalizzata senza spese si può eliminare.
- Non archiviare né eliminare la categoria `altro`.
- Rifiuta nomi di categoria duplicati, senza distinzione tra maiuscole e minuscole.
- Rifiuta la creazione o il ripristino di una categoria oltre le 15 attive (l'importazione non applica il limite).

## Spese ricorrenti

- Una regola (`recurringRules`) genera una spesa normale al mese, collegata con `recurringRuleId`.
- Genera all'avvio e quando l'app torna in primo piano, in una sola transazione: per ogni regola attiva crea le spese dei mesi successivi a `lastGeneratedMonth` fino al mese corrente, solo se il giorno è già arrivato, poi aggiorna `lastGeneratedMonth`.
- Se `dayOfMonth` supera i giorni del mese, usa l'ultimo giorno (31 → 30 settembre, 28/29 febbraio).
- Riattivando una regola sospesa non generare i mesi saltati: imposta `lastGeneratedMonth` al mese precedente a quello corrente.
- Modificare o eliminare una spesa generata non modifica la regola né la fa ricreare.

## Backup e persistenza

- Valida ogni file importato con `zod` prima di scrivere nel database.
- Il backup contiene `categories`, `expenses`, `recurringRules` e `settings` (budget); tema, lingua e altre preferenze del dispositivo restano fuori.
- Rifiuta un file con spese o regole che puntano a una categoria assente sia dal file sia dal database.
- In modalità "Unisci" non duplicare spese con stesso `id` o con stessi `date`, `amountCents`, `categoryId` e `note`; categorie e regole si uniscono per `id` (una categoria con lo stesso nome di una esistente viene ricollegata a quella); il budget del file sostituisce quello attuale solo se quello attuale manca.
- In modalità "Sostituisci" svuota e riscrivi le tabelle nella stessa transazione.
- Richiedi `navigator.storage.persist()` all'avvio dell'app installata.
- Usa il prefisso `spese:` per ogni chiave di `localStorage`.
