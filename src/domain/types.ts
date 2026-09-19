// Valori salvati nei dati e nel backup: restano in italiano anche se il codice è in inglese
export const PAYMENT_METHODS = ["carta", "contanti", "altro"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return PAYMENT_METHODS.some((method) => method === value);
}
