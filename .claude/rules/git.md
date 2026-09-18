# Git

## Branch

- Crea un branch per ogni fase della roadmap: `fase-0-setup`, `fase-1-mvp`, `fase-2-filtri`, `fase-3-grafici`, `fase-4-extra`, `rifiniture`.
- Non lavorare direttamente su `main`: ogni push su `main` pubblica l'app su GitHub Pages.
- Integra il branch in `main` solo a fase completata e dopo conferma esplicita.
- Non usare `git push --force` su `main` e non riscrivere commit già pubblicati.
- Non rinominare il repository: il nome è parte dell'indirizzo dell'app e dei dati salvati.

## Commit

- Crea un commit per step, dopo che la Definition of Done è verificata e l'utente ha confermato.
- Usa Conventional Commits in italiano: `tipo(ambito): descrizione`.
- Tipi ammessi: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `build`, `ci`, `chore`.
- Ambiti consigliati: `setup`, `db`, `spesa`, `storico`, `filtri`, `grafici`, `categorie`, `impostazioni`, `backup`, `pwa`, `ui`.
- Scrivi la descrizione all'imperativo, in minuscolo, senza punto finale, al massimo 72 caratteri (es. `feat(storico): raggruppa le spese per giorno`).
- Nel corpo del commit spiega cosa cambia e perché, in 1–3 righe.
- Non creare commit con typecheck, lint o test falliti.

## File da non versionare

- Non committare `node_modules/`, `dist/`, `dev-dist/`, `.env*`, `*.local`.
- Non committare mai backup o esportazioni personali: `spese-backup-*.json`, `spese-*.csv`, `backup/`.
- Prima di ogni commit controlla con `git status` che non ci siano file di dati personali.
