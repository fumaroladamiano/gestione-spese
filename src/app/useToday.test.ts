import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToday } from "./useToday";

describe("useToday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 16, 22, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("legge la data di oggi", () => {
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe("2026-09-16");
  });

  it("si aggiorna quando l'app torna in primo piano il giorno dopo", () => {
    const { result } = renderHook(() => useToday());
    vi.setSystemTime(new Date(2026, 8, 17, 8, 30));
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe("2026-09-17");
  });

  it("si aggiorna a mezzanotte con l'app aperta", () => {
    const { result } = renderHook(() => useToday());
    act(() => {
      vi.advanceTimersByTime(2 * 60 * 60 * 1000 + 5000);
    });
    expect(result.current).toBe("2026-09-17");
  });
});
