/** Unisce le classi CSS Modules ignorando quelle assenti o disattivate. */
export function classNames(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}
