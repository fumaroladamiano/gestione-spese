import { create } from "zustand";

export type ToastMessage = {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Foglio "Nuova / Modifica spesa". Chiudendolo si mantengono sessione e spesa,
 * così il foglio resta montato per l'animazione di uscita; ogni apertura è una nuova sessione.
 */
export type ExpenseSheetState = {
  open: boolean;
  session: number;
  /** null = nuova spesa. */
  expenseId: string | null;
};

type UiState = {
  toast: ToastMessage | null;
  expenseSheet: ExpenseSheetState;
  installGuideOpen: boolean;
  /** Banner di installazione chiuso: ricompare al prossimo avvio finché l'app non è installata. */
  installBannerDismissed: boolean;
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  hideToast: () => void;
  openNewExpense: () => void;
  openEditExpense: (expenseId: string) => void;
  closeExpenseSheet: () => void;
  setInstallGuideOpen: (open: boolean) => void;
  dismissInstallBanner: () => void;
};

let nextToastId = 1;

/** Stato temporaneo dell'interfaccia (non salvato): fogli aperti e toast. */
export const useUi = create<UiState>()((set) => ({
  toast: null,
  expenseSheet: { open: false, session: 0, expenseId: null },
  installGuideOpen: false,
  installBannerDismissed: false,
  showToast: (toast) => {
    set({ toast: { ...toast, id: nextToastId++ } });
  },
  hideToast: () => {
    set({ toast: null });
  },
  openNewExpense: () => {
    set((state) => ({
      toast: null,
      expenseSheet: {
        open: true,
        session: state.expenseSheet.session + 1,
        expenseId: null,
      },
    }));
  },
  openEditExpense: (expenseId) => {
    set((state) => ({
      toast: null,
      expenseSheet: {
        open: true,
        session: state.expenseSheet.session + 1,
        expenseId,
      },
    }));
  },
  closeExpenseSheet: () => {
    set((state) => ({ expenseSheet: { ...state.expenseSheet, open: false } }));
  },
  setInstallGuideOpen: (installGuideOpen) => {
    set({ installGuideOpen });
  },
  dismissInstallBanner: () => {
    set({ installBannerDismissed: true });
  },
}));
