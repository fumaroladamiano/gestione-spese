// Valori salvati nei dati e nel backup: restano in italiano anche se il codice è in inglese
export const PAYMENT_METHODS = ["carta", "contanti", "altro"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return PAYMENT_METHODS.some((method) => method === value);
}

/** Limiti dei dati (proposta § 3.2, punto C6). */
export const LIMITS = {
  /** 999.999,99 € */
  maxAmountCents: 99_999_999,
  /** cifre intere digitabili sul tastierino */
  maxIntegerDigits: 6,
  noteLength: 40,
  categoryNameLength: 20,
  maxActiveCategories: 15,
} as const;

/** Data locale della spesa, sempre nel formato YYYY-MM-DD. */
export type ISODate = string;
/** Mese nel formato YYYY-MM. */
export type MonthKey = string;

export type Expense = {
  id: string;
  amountCents: number;
  categoryId: string;
  date: ISODate;
  /** Stringa vuota se assente. */
  note: string;
  paymentMethod: PaymentMethod;
  /** Presente solo sulle spese collegate a una regola ricorrente (fase 4). */
  recurringRuleId?: string;
  createdAt: string;
  updatedAt: string;
};

/** Campi che l'utente inserisce o modifica. */
export type ExpenseInput = Pick<
  Expense,
  "amountCents" | "categoryId" | "date" | "note" | "paymentMethod"
>;

export type Category = {
  id: string;
  /** null = predefinita mai rinominata: il nome mostrato viene dai dizionari. */
  name: string | null;
  icon: string;
  colorLight: string;
  colorDark: string;
  builtin: boolean;
  archived: boolean;
  createdAt: string;
};

export type RecurringRule = {
  id: string;
  amountCents: number;
  categoryId: string;
  note: string;
  paymentMethod: PaymentMethod;
  dayOfMonth: number;
  active: boolean;
  lastGeneratedMonth: MonthKey;
  createdAt: string;
  updatedAt: string;
};

export type SettingRow = { key: "budgetCents"; value: number };
