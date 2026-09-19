import { describe, expect, it } from "vitest";
import { newId } from "./ids";

describe("newId", () => {
  it("genera 32 caratteri esadecimali", () => {
    expect(newId()).toMatch(/^[0-9a-f]{32}$/);
  });

  it("non ripete gli id", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newId()));
    expect(ids.size).toBe(1000);
  });
});
