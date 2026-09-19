import "@testing-library/jest-dom/vitest";
// IndexedDB simulato in Node: i repository Dexie si testano senza browser
import "fake-indexeddb/auto";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
