import { describe, expect, it } from "vitest";
import { classNames } from "./classNames";

describe("classNames", () => {
  it("unisce solo le classi presenti", () => {
    expect(classNames("a", undefined, false, "b", null)).toBe("a b");
    expect(classNames(undefined)).toBe("");
  });
});
