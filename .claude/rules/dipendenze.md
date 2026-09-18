---
paths:
  - "package.json"
  - "package-lock.json"
---

# Dipendenze

## Prima di aggiungere una libreria

- Controlla se è già nella tabella "Stack e librerie" di `CLAUDE.md`; se non c'è, chiedi prima di installarla.
- Nella richiesta scrivi: problema da risolvere, alternative considerate (compresa "senza libreria"), peso compresso, stato di manutenzione, licenza.
- Verifica che funzioni in Safari iOS e nel browser senza API di Node.js.
- Verifica che non richieda servizi esterni, CDN o chiamate di rete a runtime (l'app deve funzionare offline).
- Non aggiungere librerie per ciò che si risolve in meno di ~30 righe (formattazione valuta, clonazione, unione di classi CSS, debounce).
- Non aggiungere librerie di componenti UI complete né framework CSS: si usano CSS Modules e i token.
- Non aggiungere librerie di grafici: i grafici sono componenti SVG su misura.

## Installazione

- Installa con `npm install <pacchetto>` (strumenti di sviluppo con `npm install -D <pacchetto>`).
- Versiona sempre `package-lock.json` insieme a `package.json`.
- Non usare `npm install --force` o `--legacy-peer-deps` senza segnalarlo nel riepilogo.
- Aggiorna la tabella "Stack e librerie" di `CLAUDE.md` nello stesso step.

## Peso e aggiornamenti

- Mantieni il bundle JavaScript iniziale sotto i 200 KB compressi; controllalo nell'output di `npm run build`.
- Importa singole funzioni o icone (`import { format } from 'date-fns'`), mai l'intero pacchetto.
- Aggiorna le dipendenze in uno step dedicato, non insieme a una funzionalità.
