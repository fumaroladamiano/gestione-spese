/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

import "react";

declare global {
  /** Versione dell'app da package.json (definita in vite.config.ts). */
  const __APP_VERSION__: string;
}

declare module "react" {
  // proprietà personalizzate CSS (--c-light, --c-dark…) negli stili inline
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
