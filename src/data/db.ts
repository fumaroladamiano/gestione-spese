import { Dexie, type EntityTable } from "dexie";
import type {
  Category,
  Expense,
  RecurringRule,
  SettingRow,
} from "../domain/types";

// Nome univoco: tutti i siti GitHub Pages dell'account condividono lo stesso spazio del browser
export const DATABASE_NAME = "spese";

export type SpeseDatabase = Dexie & {
  expenses: EntityTable<Expense, "id">;
  categories: EntityTable<Category, "id">;
  recurringRules: EntityTable<RecurringRule, "id">;
  settings: EntityTable<SettingRow, "key">;
};

export const db = new Dexie(DATABASE_NAME) as SpeseDatabase;

// Versione 1: contiene già tutte le tabelle, anche quelle usate solo dalla fase 4,
// per evitare migrazioni appena l'app è in uso. Non va più modificata dopo la pubblicazione:
// ogni cambiamento è una nuova versione (database.md, proposta § 3.8).
db.version(1).stores({
  expenses:
    "id, date, categoryId, recurringRuleId, [categoryId+date], [date+createdAt]",
  categories: "id",
  recurringRules: "id",
  settings: "key",
});
