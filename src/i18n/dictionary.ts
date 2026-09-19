import type { it } from "./it";

// Tipo derivato da it.ts: i testi diventano string, le funzioni mantengono i parametri
export type Dictionary = {
  [K in keyof typeof it]: (typeof it)[K] extends (...args: infer A) => string
    ? (...args: A) => string
    : string;
};

export type TextKey = keyof Dictionary;

export type TextArgs<K extends TextKey> = Dictionary[K] extends (
  ...args: infer A
) => string
  ? A
  : [];

export type Translate = <K extends TextKey>(
  key: K,
  ...args: TextArgs<K>
) => string;
