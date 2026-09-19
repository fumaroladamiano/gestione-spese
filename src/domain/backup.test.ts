import { describe, expect, it } from "vitest";
import { buildBackup, planMerge, type BackupData } from "./backup";
import { parseBackup } from "./backupSchema";
import { buildCsv } from "./csv";
import type { Category, Expense } from "./types";

const spesa: Category = {
  id: "spesa",
  name: null,
  icon: "cart",
  colorLight: "#34C759",
  colorDark: "#30D158",
  builtin: true,
  archived: false,
  createdAt: "2026-09-01T00:00:00.000Z",
};

function expense(id: string, overrides: Partial<Expense> = {}): Expense {
  return {
    id,
    amountCents: 1250,
    categoryId: "spesa",
    date: "2026-09-16",
    note: "Esselunga",
    paymentMethod: "carta",
    createdAt: "2026-09-16T10:00:00.000Z",
    updatedAt: "2026-09-16T10:00:00.000Z",
    ...overrides,
  };
}

const data: BackupData = {
  categories: [spesa],
  expenses: [expense("a"), expense("b", { recurringRuleId: "r1" })],
  recurringRules: [],
  budgetCents: 150000,
};

const NOW = new Date("2026-09-19T08:00:00.000Z");

describe("backup JSON", () => {
  it("esporta e reimporta gli stessi dati", () => {
    const text = JSON.stringify(buildBackup(data, NOW));
    expect(JSON.parse(text)).toMatchObject({
      app: "spese",
      schemaVersion: 1,
      exportedAt: NOW.toISOString(),
    });
    expect(parseBackup(text)).toEqual(data);
  });

  it("rifiuta file non validi", () => {
    const valid = buildBackup(data, NOW);
    expect(parseBackup("non è json")).toBeNull();
    expect(parseBackup(JSON.stringify({ ...valid, app: "altro" }))).toBeNull();
    expect(
      parseBackup(JSON.stringify({ ...valid, schemaVersion: 99 })),
    ).toBeNull();
    expect(
      parseBackup(
        JSON.stringify({
          ...valid,
          expenses: [expense("x", { amountCents: -5 })],
        }),
      ),
    ).toBeNull();
    expect(
      parseBackup(
        JSON.stringify({
          ...valid,
          expenses: [expense("x", { date: "2026-02-30" })],
        }),
      ),
    ).toBeNull();
  });

  it("rifiuta spese con categorie assenti dal file e dal database", () => {
    const orphan = JSON.stringify(
      buildBackup({ ...data, categories: [], expenses: [expense("x")] }, NOW),
    );
    expect(parseBackup(orphan)).toBeNull();
    expect(parseBackup(orphan, new Set(["spesa"]))).not.toBeNull();
  });

  it("accetta file senza regole ricorrenti né budget", () => {
    const full = buildBackup(data, NOW);
    const minimal = {
      app: full.app,
      schemaVersion: full.schemaVersion,
      exportedAt: full.exportedAt,
      categories: full.categories,
      expenses: full.expenses,
    };
    expect(parseBackup(JSON.stringify(minimal))).toMatchObject({
      recurringRules: [],
      budgetCents: null,
    });
  });
});

describe("Unisci", () => {
  const names = (category: Category) => [category.name ?? category.id];

  it("non duplica spese con lo stesso id o con stessi data, importo, categoria e nota", () => {
    const incoming: BackupData = {
      ...data,
      expenses: [
        expense("a"), // stesso id
        expense("z"), // stesso contenuto di "a"
        expense("new", { amountCents: 999 }),
      ],
    };
    const plan = planMerge(data, incoming, names);
    expect(plan.expenses.map((e) => e.id)).toEqual(["new"]);
  });

  it("ricollega una categoria con lo stesso nome a quella esistente", () => {
    const current: BackupData = {
      ...data,
      categories: [{ ...spesa, id: "c1", name: "Palestra", builtin: false }],
      expenses: [],
    };
    const incoming: BackupData = {
      categories: [{ ...spesa, id: "c2", name: "palestra", builtin: false }],
      expenses: [expense("e1", { categoryId: "c2" })],
      recurringRules: [],
      budgetCents: null,
    };
    const plan = planMerge(current, incoming, names);
    expect(plan.categories).toEqual([]);
    expect(plan.expenses[0]?.categoryId).toBe("c1");
  });

  it("usa il budget del file solo se oggi non ce n'è uno", () => {
    expect(
      planMerge({ ...data, budgetCents: null }, data, names).budgetCents,
    ).toBe(150000);
    expect(
      planMerge(data, { ...data, budgetCents: 2000 }, names).budgetCents,
    ).toBeNull();
  });
});

describe("CSV per Excel", () => {
  it("usa ; e virgola decimale anche con l'app in inglese, con BOM e virgolette", () => {
    const csv = buildCsv(
      [
        expense("a", { amountCents: 123456, note: 'Cena "al mare"; amici' }),
        expense("b", { recurringRuleId: "r1" }),
      ],
      () => "Spesa",
      () => "Carta",
    );
    expect(csv.startsWith(String.fromCharCode(0xfeff))).toBe(true);
    const lines = csv.slice(1).trimEnd().split("\r\n");
    expect(lines).toEqual([
      "data;categoria;importo_eur;descrizione;metodo;ricorrente",
      '2026-09-16;Spesa;1234,56;"Cena ""al mare""; amici";Carta;no',
      "2026-09-16;Spesa;12,50;Esselunga;Carta;sì",
    ]);
  });
});
