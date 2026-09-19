import { isDataError } from "../data/errors";
import type { TextKey } from "./dictionary";

/** Testo del toast per un errore dei repository; gli errori imprevisti hanno un messaggio generico. */
export function errorTextKey(error: unknown): TextKey {
  if (!isDataError(error)) return "errorGeneric";
  switch (error.code) {
    case "invalidAmount":
    case "invalidBudget":
      return "errorInvalidAmount";
    case "futureDate":
      return "errorFutureDate";
    case "unknownCategory":
    case "archivedCategory":
      return "errorCategory";
    default:
      return "errorGeneric";
  }
}
