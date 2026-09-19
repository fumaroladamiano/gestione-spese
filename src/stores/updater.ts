import { create } from "zustand";

type UpdaterState = {
  /** Registrazione del service worker, presente solo nell'app pubblicata. */
  registration: ServiceWorkerRegistration | null;
  setRegistration: (registration: ServiceWorkerRegistration) => void;
};

/** Service worker registrato, per il pulsante "Cerca aggiornamenti" in Impostazioni. */
export const useUpdater = create<UpdaterState>()((set) => ({
  registration: null,
  setRegistration: (registration) => {
    set({ registration });
  },
}));
