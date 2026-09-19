import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { CategoryIcon } from "../../components/CategoryIcon";
import { ListGroup } from "../../components/ListGroup";
import { Page } from "../../components/Page";
import type { Category } from "../../domain/types";
import { useT } from "../../i18n/useT";
import styles from "./CategoriesPage.module.css";
import { CategorySheet } from "./CategorySheet";
import { useCategoryCounts } from "./useCategoryActions";
import { useCategories, useCategoryName } from "./useCategories";

/** Impostazioni → Categorie: attive, archiviate e nuova categoria. */
export function CategoriesPage() {
  const t = useT();
  const categories = useCategories() ?? [];
  const counts = useCategoryCounts();
  const nameOf = useCategoryName();
  const [sheet, setSheet] = useState<{
    open: boolean;
    session: number;
    category: Category | null;
  }>({ open: false, session: 0, category: null });

  const open = (category: Category | null) => {
    setSheet((current) => ({
      open: true,
      session: current.session + 1,
      category,
    }));
  };

  const row = (category: Category) => (
    <button
      key={category.id}
      type="button"
      className={styles.row}
      onClick={() => {
        open(category);
      }}
    >
      <CategoryIcon category={category} size={32} />
      <span className={styles.name}>{nameOf(category)}</span>
      <span className={styles.count}>
        {t("nExpenses", counts.get(category.id) ?? 0)}
      </span>
      <ChevronRight
        className={styles.chevron}
        size={18}
        strokeWidth={2.4}
        aria-hidden
      />
    </button>
  );

  const active = categories.filter((category) => !category.archived);
  const archived = categories.filter((category) => category.archived);

  return (
    <Page
      title={t("categories")}
      back={{
        label: t("settingsTitle"),
        to: "/settings",
        ariaLabel: t("back", t("settingsTitle")),
      }}
      action={
        <button
          type="button"
          className={styles.add}
          aria-label={t("newCategory")}
          onClick={() => {
            open(null);
          }}
        >
          <Plus size={20} strokeWidth={2.6} aria-hidden />
        </button>
      }
    >
      <ListGroup title={t("activeCategories")} footer={t("categoriesFooter")}>
        {active.map(row)}
      </ListGroup>
      <ListGroup>
        <button
          type="button"
          className={styles.newRow}
          onClick={() => {
            open(null);
          }}
        >
          <Plus size={20} strokeWidth={2.4} aria-hidden />
          {t("newCategory")}
        </button>
      </ListGroup>
      {archived.length > 0 ? (
        <ListGroup title={t("archivedCategories")}>
          {archived.map(row)}
        </ListGroup>
      ) : null}

      <CategorySheet
        key={sheet.session}
        open={sheet.open}
        category={sheet.category}
        expenseCount={sheet.category ? (counts.get(sheet.category.id) ?? 0) : 0}
        onClose={() => {
          setSheet((current) => ({ ...current, open: false }));
        }}
      />
    </Page>
  );
}
