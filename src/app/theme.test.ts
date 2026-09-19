import { beforeEach, describe, expect, it } from "vitest";
import { applyTheme } from "./theme";

function themeColors(): string[] {
  return [
    ...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
  ].map((meta) => meta.content);
}

describe("applyTheme", () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <meta name="theme-color" content="" media="(prefers-color-scheme: light)">
      <meta name="theme-color" content="" media="(prefers-color-scheme: dark)">`;
    delete document.documentElement.dataset.theme;
  });

  it("con il tema automatico non forza nulla e usa un colore per ogni schema", () => {
    document.documentElement.dataset.theme = "dark";
    applyTheme("auto");
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(themeColors()).toEqual(["#F3F3F8", "#000000"]);
  });

  it("forza il tema scuro anche con l'iPhone in modalità chiara", () => {
    applyTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(themeColors()).toEqual(["#000000", "#000000"]);
  });

  it("forza il tema chiaro", () => {
    applyTheme("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(themeColors()).toEqual(["#F3F3F8", "#F3F3F8"]);
  });
});
