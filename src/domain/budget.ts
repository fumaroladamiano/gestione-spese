/** Soglie del budget (proposta § 1.3.5): sotto l'80% va bene, fino al 100% attenzione, oltre sforato. */
export const BUDGET_WARNING_RATIO = 0.8;

export type BudgetLevel = "ok" | "warning" | "over";

export type BudgetStatus = {
  /** Quota spesa (0.86 = 86%); può superare 1. */
  ratio: number;
  /** Quanto resta (negativo se sforato). */
  remainingCents: number;
  level: BudgetLevel;
};

export function budgetStatus(
  spentCents: number,
  budgetCents: number,
): BudgetStatus {
  const ratio = budgetCents > 0 ? spentCents / budgetCents : 0;
  return {
    ratio,
    remainingCents: budgetCents - spentCents,
    level:
      ratio > 1 ? "over" : ratio >= BUDGET_WARNING_RATIO ? "warning" : "ok",
  };
}

/**
 * Proiezione a fine mese al ritmo attuale: totale / giorni trascorsi × giorni del mese.
 * 0 se non è trascorso nessun giorno.
 */
export function projectMonthEnd(
  spentCents: number,
  elapsedDays: number,
  daysInMonth: number,
): number {
  return elapsedDays > 0
    ? Math.round((spentCents / elapsedDays) * daysInMonth)
    : 0;
}
