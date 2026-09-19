---
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
  - "index.html"
---

# Interfaccia e design system

Fonte dei valori: proposta § 1.5. Riferimento visivo: `docs/prototipo-app-spese.html` (direzione "iOS raffinato").

## Token

- Usa solo variabili CSS definite in `src/styles/tokens.css` per colori, gradienti, ombre, spaziature, raggi e tipografia.
- Non scrivere colori esadecimali nei componenti o nei CSS Modules; unica eccezione: i colori delle categorie letti dal database.
- Definisci ogni token colore, gradiente e ombra sia per il tema chiaro sia per quello scuro (`prefers-color-scheme` e attributo `data-theme`); in dark le ombre diventano un bordo hairline.
- Usa solo le spaziature 4, 8, 12, 16, 20, 24, 32 px.
- Usa solo i raggi `xs` 8, `sm` 10, `md` 16, `lg` 22, `xl` 28 px e `full` (999 px); per le icone "squircle" il raggio è circa il 32% del lato (40 → 13, 54 → 18, 84 → 28).
- Mantieni 16 px di margine laterale per card e liste; 20 px per large title e titoli di sezione.
- Usa il testo di stato (`positiveText`, `warningText`, `dangerText`) per scritte colorate su fondo chiaro: i colori pieni `positive`/`warning`/`danger` non hanno contrasto AA come testo.

## Tipografia

- Usa il font di sistema (`-apple-system, system-ui`); non scaricare font.
- Imposta `font: -apple-system-body` sulla radice ed esprimi le dimensioni in `rem`, così si rispetta la dimensione del testo di iOS.
- Usa `ui-rounded` e `font-variant-numeric: tabular-nums` per tutti gli importi e per i tasti del tastierino.
- Non usare campi di input con testo sotto i 16 px (Safari zooma la pagina).
- Usa solo gli stili tipografici della tabella della proposta (Large Title, Section Title, Headline, Body, Caption…).
- Scrivi titoli di sezione e di giorno in minuscolo con iniziale maiuscola, non in MAIUSCOLO; il MAIUSCOLO non si usa nell'interfaccia.

## Categorie e icone

- Usa i colori delle categorie della tabella della proposta, variante chiara e scura.
- Mostra le icone categoria come squircle con fondo tenue (15% in chiaro, 22% in scuro) e glifo del colore della categoria, in liste, legende e griglia.
- Nella griglia di inserimento la categoria scelta diventa piena (glifo bianco) con anello colorato e leggero ingrandimento.
- Usa l'icona piena (glifo bianco su colore) solo per l'anteprima nel foglio categoria.
- Usa solo icone di `lucide-react`, importate singolarmente.
- Converti il nome salvato dell'icona categoria (`cart`, `heart`…) nel componente Lucide solo nella mappa di `src/components/CategoryGlyph.ts`; Salute usa il cuore semplice (`Heart`) come nel prototipo.

## Componenti chiave

- Home: card del mese (`MonthHeroCard`) con gradiente `heroGradient`, testo bianco, decimali e simbolo € attenuati, barra budget su traccia bianca traslucida.
- Sotto l'hero, due riquadri affiancati: "Oggi" (importo e numero di spese) e "Media al giorno" (mini barre degli ultimi 7 giorni, oggi evidenziato).
- Tab bar sospesa: capsula `full` con sfondo traslucido e sfocato, staccata dai bordi, 5 elementi con "+" centrale rotondo in gradiente; la tab attiva ha un fondo `tintSoft`.
- Pulsante primario dei fogli ("Salva") come pillola piena `tint`; disattivato con fondo `fill` e testo `tertiaryLabel`.
- Chip: pillole su `surface` con ombra; selezionate piene `tint` con testo bianco (nei filtri e nelle date: `tintSoft` con bordo `tint`).
- Tastierino: tasti `surface` con raggio `md` sullo sfondo del foglio; virgola e cancella su `fill`; tasto premuto `tintSoft`.

## Feeling iOS

- Usa large title nelle schermate principali e liste "inset grouped" con raggio `lg`.
- Usa la tab bar a 5 elementi con il pulsante "+" centrale.
- Apri inserimento, filtri e categorie come fogli dal basso (raggio `xl`) chiudibili con `Annulla` o trascinamento; la schermata sotto si rimpicciolisce.
- Aggiungi un pulsante "‹" esplicito in ogni pagina secondaria (in standalone non c'è il gesto indietro).
- Usa il tastierino numerico integrato per gli importi, mai la tastiera di sistema.
- Rispetta le aree sicure con `env(safe-area-inset-*)` e usa `dvh` invece di `vh`; la tab bar sospesa e i toast stanno sopra l'home indicator.
- Blocca il rimbalzo della pagina con `overscroll-behavior` e disattiva `-webkit-touch-callout` sui controlli.
- Mostra conferme ed errori con toast; usa action sheet solo per azioni distruttive o scelte multiple.

## Accessibilità

- Dai a ogni elemento toccabile un'area di almeno 44 × 44 px.
- Rispetta il contrasto AA in entrambi i temi, anche per il testo bianco sull'hero e sul "+".
- Dai a ogni riga spesa un `aria-label` completo (importo, categoria, nota, giorno, metodo).
- Rendi ogni azione dello swipe raggiungibile anche con un tap (foglio Modifica con "Elimina").
- Non usare il colore come unico indicatore: affianca ▲/▼ al rosso/verde e il testo "Restano/Sforato" alla barra del budget.
- Con `prefers-reduced-motion` sostituisci shake e rimbalzi con dissolvenze.

## Formattazione e testi

- Segui [`lingue.md`](lingue.md): testi solo dai dizionari IT/EN, formati con la lingua attiva.
- Formatta importi, percentuali e date solo con gli helper di `src/domain`; non concatenare a mano il simbolo `€` né separatori decimali.
- Se una schermata diverge dal prototipo o dalla proposta, segnalalo invece di scegliere.
