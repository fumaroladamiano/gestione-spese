/**
 * Id casuale di 16 byte in esadecimale.
 * Non usa crypto.randomUUID(): sull'iPhone in rete locale (http) non esiste,
 * mentre crypto.getRandomValues funziona anche fuori dai contesti sicuri.
 */
export function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
