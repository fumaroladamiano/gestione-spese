import { useEffect, useState } from "react";

export type PersistState = "checking" | "on" | "off" | "unsupported";

export type StorageStatus = {
  persist: PersistState;
  /** Byte usati dall'app nel browser, null se non disponibile. */
  usageBytes: number | null;
};

/** Archiviazione persistente e spazio usato (Storage API), letti all'apertura delle Impostazioni. */
export function useStorageStatus(): StorageStatus {
  const [status, setStatus] = useState<StorageStatus>({
    persist: "checking",
    usageBytes: null,
  });

  useEffect(() => {
    let cancelled = false;
    const read = async (): Promise<StorageStatus> => {
      if (
        !("storage" in navigator) ||
        typeof navigator.storage.persisted !== "function"
      ) {
        return { persist: "unsupported", usageBytes: null };
      }
      const persisted = await navigator.storage.persisted();
      const estimate =
        typeof navigator.storage.estimate === "function"
          ? await navigator.storage.estimate()
          : undefined;
      return {
        persist: persisted ? "on" : "off",
        usageBytes: estimate?.usage ?? null,
      };
    };
    read()
      .then((next) => {
        if (!cancelled) setStatus(next);
      })
      .catch((error: unknown) => {
        console.error(error);
        if (!cancelled) setStatus({ persist: "unsupported", usageBytes: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
