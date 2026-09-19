/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

import "react";

declare module "react" {
  // proprietà personalizzate CSS (--c-light, --c-dark…) negli stili inline
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
