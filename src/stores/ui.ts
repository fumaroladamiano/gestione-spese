import { create } from "zustand";

export type ToastMessage = {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export type ExpenseSheetState =
  { mode: "closed" } | { mode: "new" } | { mode: "edit"; expenseId: string };

type UiState = {
  toast: ToastMessage | null;
  expenseSheet: ExpenseSheetState;
  installGuideOpen: boolean;
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  hideToast: () => void;
  openNewExpense: () => void;
  openEditExpense: (expenseId: string) => void;
  closeExpenseSheet: () => void;
  setInstallGuideOpen: (open: boolean) => void;
};

let nextToastId = 1;

/** Stato temporaneo dell'interfaccia (non salvato): fogli aperti e toast. */
export const useUi = create<UiState>()((set) => ({
  toast: null,
  expenseSheet: { mode: "closed" },
  installGuideOpen: false,
  showToast: (toast) => {
    set({ toast: { ...toast, id: nextToastId++ } });
  },
  hideToast: () => {
    set({ toast: null });
  },
  openNewExpense: () => {
    set({ expenseSheet: { mode: "new" }, toast: null });
  },
  openEditExpense: (expenseId) => {
    set({ expenseSheet: { mode: "edit", expenseId }, toast: null });
  },
  closeExpenseSheet: () => {
    set({ expenseSheet: { mode: "closed" } });
  },
  setInstallGuideOpen: (installGuideOpen) => {
    set({ installGuideOpen });
  },
}));
