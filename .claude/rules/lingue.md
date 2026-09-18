---
paths:
  - "src/**/*.{ts,tsx}"
  - "tests/**/*.ts"
  - "index.html"
---

# Lingue (italiano e inglese)

Decisione D17 della proposta: interfaccia in italiano (predefinito) e inglese, scelta dall'utente in Impostazioni. Riferimento di comportamento: `docs/prototipo-app-spese-v2.html`.

## Dizionari

- Tieni tutti i testi visibili in `src/i18n/it.ts` e `src/i18n/en.ts`; nessun testo scritto direttamente in componenti, hook o messaggi dei toast.
- Usa `it.ts` come fonte del tipo: `en.ts` deve avere esattamente le stesse chiavi (`satisfies Dictionary`), così una traduzione mancante è un errore di `typecheck`.
- Leggi i testi solo con l'helper `t()` di `src/i18n`; nessuna libreria i18n.
- Scrivi i testi con parametri e i plurali come funzioni nel dizionario (`nExpenses: (n) => …`), non concatenando pezzi di frase.
- Dai alle chiavi nomi in inglese e per significato (`addExpense`, `filteredTotal`), non il testo italiano.
- Aggiungi o modifica una chiave sempre in entrambi i dizionari nello stesso step.

## Lingua attiva

- Salva la lingua nelle Impostazioni (`it` | `en`); se manca o non è valida usa `it`.
- Non rilevare la lingua dal dispositivo o dal browser: l'app parte sempre in italiano finché l'utente non la cambia.
- Al cambio di lingua aggiorna subito tutta l'interfaccia (compresi fogli aperti) e l'attributo `lang` di `<html>`.
- Il nome dell'app e il manifest della PWA restano "Spese" in entrambe le lingue.

## Formati

- Deriva il locale dalla lingua: `it` → `it-IT` e locale date-fns `it`; `en` → `en-IE` e locale date-fns `enIE`.
- Formatta importi, percentuali e date solo con gli helper di `src/domain`, che ricevono il locale come parametro; mai `toLocaleString()` senza locale.
- Settimana sempre da lunedì in entrambe le lingue; valuta sempre euro.
- Sul tastierino mostra il separatore decimale della lingua (`,` o `.`); internamente l'importo resta in centesimi interi. Dalla tastiera fisica accetta sia `,` sia `.`.
- Nei campi di testo che accettano importi (es. budget) interpreta il formato della lingua attiva (`1.234,50` oppure `1,234.50`).

## Dati

- Non salvare testi tradotti nel database né nel backup: solo id, valori e nomi scelti dall'utente.
- Categorie predefinite: mostra il nome tradotto solo finché l'utente non lo rinomina; se lo salva senza modificarlo, conserva il nome originale.
- Categorie create dall'utente, note delle spese e nomi rinominati non si traducono mai.
- Il controllo di unicità dei nomi categoria confronta i nomi mostrati, senza distinzione maiuscole.
- Esporta il CSV sempre in formato italiano (`;`, virgola decimale, intestazioni in italiano) qualunque sia la lingua.

## Verifica

- Controlla ogni schermata toccata in entrambe le lingue: testi che non vanno a capo male, importi lunghi, etichette della tab bar.
- Gli `aria-label` seguono la lingua attiva come i testi visibili.
