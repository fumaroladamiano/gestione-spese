import { useSyncExternalStore } from "react";
import { todayISO } from "../domain/dates";
import type { ISODate } from "../domain/types";

/**
 * Data di oggi condivisa da tutte le pagine. iOS tiene l'app sospesa anche per giorni:
 * senza questo controllo, al rientro la Home resterebbe ferma a ieri.
 */
let current: ISODate = todayISO();
const listeners = new Set<() => void>();
let midnightTimer: number | undefined;

function refresh(): void {
  const next = todayISO();
  if (next !== current) {
    current = next;
    for (const listener of listeners) listener();
  }
  scheduleMidnight();
}

/** Prossimo controllo poco dopo la mezzanotte (con l'app aperta la data cambia da sola). */
function scheduleMidnight(): void {
  if (midnightTimer !== undefined) window.clearTimeout(midnightTimer);
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 1, 0);
  midnightTimer = window.setTimeout(
    refresh,
    midnight.getTime() - now.getTime(),
  );
}

function onVisible(): void {
  if (document.visibilityState === "visible") refresh();
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    scheduleMidnight();
  }
  // fra un render e l'altro la data può essere già cambiata
  refresh();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
      if (midnightTimer !== undefined) window.clearTimeout(midnightTimer);
      midnightTimer = undefined;
    }
  };
}

function getSnapshot(): ISODate {
  return current;
}

/** "Oggi" nel formato YYYY-MM-DD, aggiornato al ritorno in primo piano e a mezzanotte. */
export function useToday(): ISODate {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
