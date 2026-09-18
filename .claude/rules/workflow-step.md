# Procedura di ogni step

Si applica a ogni step di sviluppo, su qualsiasi file.

## 1. Prima di iniziare

- Rileggi `CLAUDE.md` e le regole di `.claude/rules/` pertinenti ai file coinvolti.
- Scrivi in chat, prima di toccare qualsiasi file:
  - l'obiettivo dello step in 1–2 righe;
  - la fase della roadmap a cui appartiene;
  - l'elenco dei file che creerai o modificherai;
  - cosa resta esplicitamente fuori dallo step.
- Attendi la conferma esplicita dell'utente. Non modificare file prima della conferma.

## 2. Durante lo step

- Modifica solo i file dichiarati. Se ne serve un altro, fermati e chiedi.
- Non aggiungere funzionalità, librerie o scelte tecniche assenti da `CLAUDE.md` o dalla proposta: chiedi.
- Se proposta, prototipo e richiesta sono in contraddizione, segnala la contraddizione e non scegliere da solo.
- Non lasciare `TODO` senza descriverli nel riepilogo finale.

## 3. Alla fine dello step

- Esegui `npm run typecheck`, `npm run lint`, `npm test` e `npm run build`; riporta l'esito reale, errori compresi.
- Se lo step tocca l'interfaccia, esegui anche `npm run test:e2e` (WebKit).
- Verifica la compatibilità con Safari iOS:
  - nessuna API non supportata da WebKit iOS (es. Vibration API, Background Sync);
  - `npm run preview` funziona su `http://localhost:4173/spese/` anche offline dopo il primo caricamento.
- Aggiorna la colonna "Stato" della roadmap in `CLAUDE.md` (e la tabella stack se sono cambiate librerie).
- Scrivi un riepilogo breve con tre sezioni:
  - **Cosa è cambiato**: file e comportamento;
  - **Come provarlo sull'iPhone**: indirizzo (rete locale o GitHub Pages) e passaggi;
  - **Punti aperti**: dubbi, limiti, decisioni da prendere.
- Proponi il messaggio di commit secondo `git.md` e crea il commit solo dopo conferma.

## 4. Definition of Done

Uno step è concluso solo se tutte le voci sono vere:

- [ ] Lo scope corrisponde a quanto confermato all'inizio
- [ ] `npm run typecheck` senza errori
- [ ] `npm run lint` senza errori né warning
- [ ] `npm test` verde, con i test obbligatori di `test.md` per il codice toccato
- [ ] `npm run build` riuscito
- [ ] `npm run test:e2e` verde (solo se lo step tocca la UI)
- [ ] Nessuna API incompatibile con Safari iOS; app funzionante offline in `npm run preview`
- [ ] Testi visibili solo dai dizionari, presenti in italiano e inglese; importi e date formattati con la lingua attiva (`it-IT` / `en-IE`)
- [ ] UI verificata in entrambe le lingue (solo se lo step tocca la UI)
- [ ] UI verificata in tema chiaro e scuro (solo se lo step tocca la UI)
- [ ] Nessun dato personale, backup o segreto nei file versionati
- [ ] Roadmap in `CLAUDE.md` aggiornata
- [ ] Riepilogo scritto e commit proposto
