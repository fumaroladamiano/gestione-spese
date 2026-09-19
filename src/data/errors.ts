/** Motivi per cui un repository rifiuta un'operazione: la UI li traduce in toast. */
export type DataErrorCode =
  | "invalidAmount"
  | "invalidDate"
  | "futureDate"
  | "invalidNote"
  | "invalidPaymentMethod"
  | "unknownCategory"
  | "archivedCategory"
  | "expenseNotFound"
  | "categoryNotFound"
  | "invalidCategoryName"
  | "duplicateCategoryName"
  | "invalidCategoryStyle"
  | "categoryLimit"
  | "categoryInUse"
  | "protectedCategory"
  | "invalidBudget";

export class DataError extends Error {
  readonly code: DataErrorCode;

  constructor(code: DataErrorCode) {
    super(`Dati non validi: ${code}`);
    // non "DataError": Dexie tratterebbe l'errore come quello omonimo di IndexedDB
    this.name = "SpeseDataError";
    this.code = code;
  }
}

export function isDataError(error: unknown): error is DataError {
  return error instanceof DataError;
}
