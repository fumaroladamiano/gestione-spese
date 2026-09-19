/**
 * true se l'app è aperta dall'icona sulla Home (non in una scheda di Safari).
 * navigator.standalone esiste solo su iOS e non è nei tipi standard: si legge con Reflect.
 */
export function isStandalone(): boolean {
  return (
    Reflect.get(navigator, "standalone") === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

/** Lo stato non cambia mentre l'app è aperta: basta leggerlo una volta. */
export function useStandalone(): boolean {
  return isStandalone();
}
