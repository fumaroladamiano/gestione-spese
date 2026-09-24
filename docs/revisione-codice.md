# Revisione del codice — settembre 2026

Revisione generale del codice dopo le fasi 0–4 e le prime rifiniture (21 settembre 2026).
Per ogni punto: cosa succede, dove, una proposta e lo spazio per la decisione.

Quadro generale: architettura a strati rispettata, test obbligatori di `test.md` presenti,
nessun problema di perdita di dati o di sicurezza.

Stati della decisione: `da decidere` · `da fare` · `non si fa` · `fatto`.

Punti applicati il 24 settembre 2026 (branch `rifiniture`): 3, 5, 6, 7, 8, 11, 16.

## Riepilogo

| # | Punto | Gruppo | Priorità | Decisione |
|---|---|---|---|---|
| 1 | "Ogni mese" su una spesa vecchia crea i mesi arretrati in silenzio | Comportamento | Alta | non si fa |
| 2 | Le ricorrenti arretrate compaiono solo alla riapertura | Comportamento | Media | non si fa |
| 3 | Una regola ricorrente non si può modificare | Comportamento | Media | fatto |
| 4 | Budget con il punto decimale letto come migliaia | Comportamento | Alta | non si fa |
| 5 | La data di "oggi" non si aggiorna al ritorno in primo piano | Comportamento | Media | fatto |
| 6 | Regole ricorrenti su categorie archiviate | Comportamento | Bassa | fatto (opzione B) |
| 7 | Proposta: ordine del foglio spesa non aggiornato | Documentazione | Bassa | fatto |
| 8 | Proposta: cita `useStartup.ts` invece di `startup.ts` | Documentazione | Bassa | fatto |
| 9 | `ExpenseForm.tsx` oltre la lunghezza indicativa | Documentazione / codice | Bassa | non si fa |
| 10 | Nomi di categoria in tutte le lingue: funzione copiata tre volte | Qualità | Bassa | non si fa |
| 11 | Errori senza toast in esportazione e importazione | Robustezza | Media | fatto |
| 12 | CSV: note che Excel legge come formule | Robustezza | Bassa | non si fa |
| 13 | Pacchetto iniziale vicino al limite di 200 KB | Prestazioni | Media | non si fa |
| 14 | Test end-to-end instabili | Test | Media | non si fa |
| 15 | CI: build e typecheck eseguiti due volte | CI | Bassa | non si fa |
| 16 | Formattatori `Intl` ricreati e suggerimento categoria a ogni lettera | Prestazioni | Bassa | fatto (solo il suggerimento, da 3 caratteri) |
| 17 | Fogli senza gestione del focus (VoiceOver) | Accessibilità | Media | non si fa |

---

## Comportamenti che possono sorprendere

### 1. "Ogni mese" su una spesa vecchia crea i mesi arretrati in silenzio

- **Cosa succede:** apri una spesa di gennaio e attivi "Ogni mese". Alla successiva apertura
  dell'app compaiono da sole le spese da febbraio a settembre, senza nessun avviso. Lo stesso
  vale per una spesa nuova con una data di mesi fa.
- **Dove:** `src/domain/recurring.ts` (`ruleFromExpense`: la regola parte dal mese della spesa),
  `src/data/repositories/recurringRules.ts` (`generateDueExpenses`).
- **Proposta:**
  - A. La regola parte dal mese corrente: niente arretrati.
  - B. Si tengono gli arretrati ma si mostra un toast "Create N spese ricorrenti".
- **Decisione:** lascia com'è, nessuna modifica
- **Note:**

### 2. Le ricorrenti arretrate compaiono solo alla riapertura

- **Cosa succede:** dopo aver salvato una spesa "Ogni mese" le spese generate non si vedono
  finché l'app non viene riaperta o non torna in primo piano.
- **Dove:** `src/app/startup.ts` (la generazione parte solo all'avvio e al ritorno in primo piano).
- **Proposta:** chiamare la generazione subito dopo il salvataggio di una spesa "Ogni mese".
  Dipende dalla scelta del punto 1: con l'opzione A il problema quasi sparisce.
- **Decisione:** lascia com'è, nessuna modifica
- **Note:**

### 3. Una regola ricorrente non si può modificare

- **Cosa succede:** se l'abbonamento aumenta di prezzo, l'unica strada è eliminare la regola e
  ricrearla. Modificare la spesa non aggiorna la regola (come previsto dalla proposta § 3.6) e
  la pagina Spese ricorrenti offre solo Sospendi, Riattiva, Elimina.
- **Dove:** `src/features/recurring/RecurringPage.tsx`, `src/features/expense/useSaveExpense.ts`.
- **Proposta:**
  - A. Nella pagina Spese ricorrenti, un foglio per modificare importo, giorno, nota e metodo della regola.
  - B. Modificando una spesa collegata a una regola attiva, chiedere "Applica anche ai prossimi mesi?".
  - C. Lasciare com'è (non previsto dalla proposta).
- **Decisione:** nella pagina spese ricorrenti, se clicco su una spesa devo poterla modificare. quando cambio l'importo chiedo se applicarlo per le prossime o anche per le spese vecchie.
- **Stato:** fatto
- **Note:** foglio "Modifica regola" con importo, nota, giorno del mese e metodo (la categoria resta
  quella di origine), più Sospendi/Riattiva ed Elimina in fondo. Cambiando l'importo si sceglie tra
  "Solo dalle prossime" e "Anche alle spese già create" (aggiorna tutte le spese della regola,
  anche quelle dei mesi chiusi).

### 4. Budget con il punto decimale letto come migliaia

- **Cosa succede:** con l'app in italiano, "15.50" nel campo budget diventa 1.550 € invece di
  15,50 €. Succede se il tastierino dell'iPhone mostra il punto (es. regione del telefono in inglese).
- **Dove:** `src/domain/money.ts` (`parseLocaleAmount`).
- **Proposta:** un punto seguito da 1–2 cifre finali, senza virgole, si legge come decimale
  ("15.50" → 15,50 €; "1.500" resta 1.500 €). Con un test che riproduce il caso.
- **Decisione:** lascia com'è, nessuna modifica
- **Note:**

### 5. La data di "oggi" non si aggiorna al ritorno in primo piano

- **Cosa succede:** se l'app resta aperta in background durante la notte, al rientro la Home
  mostra ancora ieri (data in alto, riquadro "Oggi", mese a cavallo di fine mese) finché non
  si cambia tab.
- **Dove:** `todayISO()` letto durante il render in Home, Storico e Grafici; nessun
  aggiornamento al ritorno in primo piano.
- **Proposta:** un hook `useToday()` che si aggiorna al ritorno in primo piano (e a mezzanotte se
  l'app è aperta), usato dalle pagine.
- **Decisione:** ok con la proposta
- **Stato:** fatto
- **Note:** hook `useToday()` in `src/app/useToday.ts`, usato da Home, Storico, Grafici, righe spesa
  e promemoria backup; si aggiorna al ritorno in primo piano e poco dopo la mezzanotte.

### 6. Regole ricorrenti su categorie archiviate

- **Cosa succede:** una regola continua a generare spese in una categoria archiviata, perché la
  generazione non passa dai controlli del repository.
- **Dove:** `src/data/repositories/recurringRules.ts` (`generateDueExpenses`).
- **Proposta:**
  - A. Va bene così: la regola è una scelta esplicita, la spesa resta visibile nello storico.
  - B. Archiviando una categoria si sospendono le sue regole (con un avviso nel foglio categoria).
- **Decisione:** B
- **Stato:** fatto
- **Note:** `archiveCategory` sospende le regole della categoria nella stessa transazione; il foglio
  categoria avvisa prima ("Le sue N spese ricorrenti verranno sospese"). Ripristinando la categoria
  le regole restano sospese: si riattivano dalla pagina Spese ricorrenti.

---

## Documentazione non allineata al codice

### 7. Proposta: ordine del foglio spesa non aggiornato

- **Cosa succede:** la proposta descrive ancora i chip (data, metodo, ricorrenza) prima della nota;
  da oggi la nota viene subito dopo le categorie.
- **Dove:** `docs/proposta-app-spese.md` § 1.3 (tabella dei tocchi e diagramma del flusso).
- **Proposta:** aggiornare il testo e il diagramma.
- **Decisione:** ok con la proposta
- **Stato:** fatto
- **Note:** aggiornati § 1.3.2 (testo e wireframe), la tabella dei tocchi e il diagramma di § 1.4.1.

### 8. Proposta: cita `useStartup.ts` invece di `startup.ts`

- **Dove:** `docs/proposta-app-spese.md`, albero delle cartelle (§ 4.3).
- **Proposta:** correggere il nome del file.
- **Decisione:** ok con la proposta
- **Stato:** fatto
- **Note:** nell'albero ora compaiono `startup.ts` e `useToday.ts`.

### 9. `ExpenseForm.tsx` oltre la lunghezza indicativa

- **Cosa succede:** il componente è a 205 righe, oltre le ~150 indicate da `typescript-codice.md`
  (era già a 198 prima delle rifiniture).
- **Proposta:** estrarre la tastiera fisica e la conferma di chiusura in un hook
  (`useExpenseFormKeys`) o in un sottocomponente.
- **Decisione:** lascia così, non fare nulla
- **Note:**

---

## Qualità e robustezza del codice

### 10. Nomi di categoria in tutte le lingue: funzione copiata tre volte

- **Dove:** `src/data/seed.ts` (`knownNames`), `src/data/repositories/categories.ts` e
  `src/data/repositories/backup.ts` (`namesOf`).
- **Proposta:** una sola funzione in `src/i18n/categoryNames.ts`, usata dai tre file.
- **Decisione:** lascia così, non fare nulla
- **Note:**

### 11. Errori senza toast in esportazione e importazione

- **Cosa succede:** se la lettura dei dati o del file fallisce, non compare nessun messaggio.
- **Dove:**
  - `src/features/settings/BackupSection.tsx` (avvio dell'esportazione e lettura del file importato);
  - `src/app/AppLayout.tsx` ("Esporta prima di installare").
- **Proposta:** gestire l'errore con il toast generico, come negli altri hook.
- **Decisione:** ok con la proposta
- **Stato:** fatto
- **Note:** `useBackupExport().build()` e `useBackupImport().read()` ora catturano l'errore, mostrano
  il toast e restituiscono `null`; "Esporta prima di installare" si ferma senza aprire il foglio.

### 12. CSV: note che Excel legge come formule

- **Cosa succede:** una nota che inizia con `=`, `+`, `-` o `@` (es. "-20% sconto") viene
  interpretata da Excel come formula e mostra un errore.
- **Dove:** `src/domain/csv.ts`.
- **Proposta:** prefissare quelle note con un apostrofo nel CSV, con un test.
- **Decisione:** lascia così, non fare nulla
- **Note:**

### 13. Pacchetto iniziale vicino al limite di 200 KB

- **Cosa succede:** il pacchetto iniziale pesa 192 KB gzip (JS e CSS), con 8 KB di margine
  rispetto al limite di `CLAUDE.md`. Il pezzo da 71 KB con Dexie e il router si chiama
  `errorMessages-*.js`: nome scelto automaticamente da Rollup, fuorviante ma innocuo.
- **Proposta:** un controllo della dimensione nella CI (fallisce oltre i 200 KB) ed eventualmente
  nomi espliciti per i pezzi della build.
- **Decisione:** lascia così, non fare nulla
- **Note:**

### 14. Test end-to-end instabili

- **Cosa succede:** oggi "si aggiunge una spesa in 3 tocchi" e "filtra per categoria e mese" sono
  falliti una volta ciascuno sull'intera suite e passati rilanciandoli. In CI il retry automatico
  nasconde il problema.
- **Proposta:** individuare le attese mancanti (di solito la fine delle animazioni dei fogli) e
  rendere i test deterministici.
- **Decisione:** lascia così, non fare nulla
- **Note:**

### 15. CI: build e typecheck eseguiti due volte

- **Cosa succede:** la build gira sia per i test end-to-end sia prima della pubblicazione; il
  typecheck gira da solo e di nuovo dentro `npm run build`.
- **Proposta:** in CI fare la build una volta e riusarla per i test e per la pubblicazione.
- **Decisione:** lascia così, non fare nulla
- **Note:**

### 16. Formattatori `Intl` ricreati e suggerimento categoria a ogni lettera

- **Cosa succede:**
  - `formatPercent`, `formatAmountField`, `decimalSeparator` e `formatInput` creano un nuovo
    `Intl.NumberFormat` a ogni chiamata (anche a ogni tasto del tastierino);
  - il suggerimento della categoria scorre tutte le spese a ogni lettera della nota.
- **Effetto:** trascurabile oggi sull'iPhone; cresce con gli anni di dati.
- **Proposta:** mettere in cache i formattatori come già si fa per la valuta; attendere una breve
  pausa di digitazione prima di cercare il suggerimento.
- **Decisione:** lascia la regola di oggi, ma parti con la ricerca del suggerimento categoria dopo 3 caratteri inseriti
- **Stato:** fatto (solo il suggerimento; i formattatori `Intl` restano come sono)
- **Note:** `findCategoryForNote` cerca solo da 3 caratteri in su (prima erano 2).

---

## Accessibilità (fase Rifiniture)

### 17. Fogli senza gestione del focus (VoiceOver)

- **Cosa succede:** i fogli dal basso non spostano il focus all'apertura e non lo trattengono al
  loro interno: con VoiceOver si può finire sulla pagina sotto il foglio.
- **Dove:** `src/components/Sheet.tsx`, `src/components/ActionSheet.tsx`.
- **Proposta:** focus sul foglio all'apertura, ritorno all'elemento di partenza alla chiusura,
  pagina sotto resa inerte (`inert`) mentre il foglio è aperto.
- **Decisione:** lascia così com'è non fare modifiche
- **Note:**
