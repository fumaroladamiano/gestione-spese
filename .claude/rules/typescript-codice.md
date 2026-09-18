---
paths:
  - "src/**/*.{ts,tsx}"
  - "tests/**/*.ts"
  - "*.config.ts"
---

# TypeScript e codice

## Compilatore

- Mantieni `strict: true` e `noUncheckedIndexedAccess: true` in `tsconfig.json`.
- Non usare `any`: usa `unknown` e restringi il tipo con controlli o `zod`.
- Non usare `@ts-ignore` né `@ts-expect-error` senza un commento che spieghi il motivo.
- Non usare `as` per forzare un tipo, salvo `as const` e restringimenti già verificati a runtime.
- Non usare l'operatore `!` di non-null, salvo su `document.getElementById('root')` in `main.tsx`.

## Nomi

- Componenti in PascalCase, un componente per file `.tsx` con lo stesso nome (`ExpenseRow.tsx`).
- Hook con prefisso `use` in camelCase (`useMonthStats.ts`).
- Funzioni e variabili in camelCase; costanti di modulo in UPPER_SNAKE_CASE.
- Tipi e interfacce in PascalCase, senza prefisso `I`.
- Campi dei dati come nel backup: `amountCents`, `categoryId`, `paymentMethod`.
- Cartelle delle feature come nella bozza del router: `home`, `spesa`, `storico`, `grafici`, `impostazioni`, `categorie`.
- Nomi che contengono importi terminano in `Cents` se sono in centesimi.
- Usa export nominati; non usare `export default`, salvo dove un file di configurazione lo richiede.

## Componenti

- Tieni i componenti sotto le ~150 righe; oltre, estrai sottocomponenti o hook.
- Tipizza sempre le props con un tipo esplicito `…Props`.
- Non mettere logica di business nei componenti: calcoli in `src/domain`, dati tramite hook che usano i repository.
- Non importare `src/data` dai componenti: passa sempre da un hook.
- Non formattare importi o date a mano nei componenti: usa gli helper di `src/domain`.
- Non usare `useEffect` per derivare dati calcolabili durante il render: usa `useMemo` o una funzione pura.

## Importi e numeri

- Non usare numeri decimali per gli euro: somma, sottrai e confronta solo centesimi interi.
- Converti input e output solo tramite le funzioni di `src/domain/money`.
- Arrotonda le percentuali solo in visualizzazione.

## Gestione errori

- Non usare `catch` vuoti: registra, rilancia o mostra un messaggio.
- Nei repository lancia errori con messaggi chiari; nella UI trasformali in toast tradotti con le chiavi dei dizionari (vedi `lingue.md`).
- Valida con `zod` ogni dato esterno (file di backup importato, parametri dell'URL).
- Non lasciare `console.log` nel codice versionato; `console.error` è ammesso solo nei gestori di errore.

## Stile

- Lascia formattazione e ordine degli import a Prettier ed ESLint; non disattivare regole senza motivazione scritta.
- Scrivi i commenti in italiano e solo per spiegare il perché, non il cosa.
