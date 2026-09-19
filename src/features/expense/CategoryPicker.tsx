import { CategoryIcon } from "../../components/CategoryIcon";
import { classNames } from "../../components/classNames";
import type { Category } from "../../domain/types";
import { useT } from "../../i18n/useT";
import { useCategoryName } from "../categories/useCategories";
import styles from "./CategoryPicker.module.css";

type CategoryPickerProps = {
  categories: Category[];
  value: string | null;
  onSelect: (categoryId: string) => void;
  shakeKey: number;
};

/** Griglia a 4 colonne: la categoria scelta si riempie del suo colore e "rimbalza". */
export function CategoryPicker({
  categories,
  value,
  onSelect,
  shakeKey,
}: CategoryPickerProps) {
  const t = useT();
  const nameOf = useCategoryName();

  return (
    <div
      key={shakeKey}
      className={classNames(styles.grid, shakeKey > 0 && styles.shake)}
      role="radiogroup"
      aria-label={t("category")}
    >
      {categories.map((category) => {
        const selected = category.id === value;
        return (
          <button
            key={category.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={classNames(styles.cell, selected && styles.selected)}
            onClick={() => {
              onSelect(category.id);
            }}
          >
            <CategoryIcon
              category={category}
              size={54}
              variant={selected ? "solid" : "soft"}
              className={styles.icon}
            />
            <span className={styles.name}>{nameOf(category)}</span>
          </button>
        );
      })}
    </div>
  );
}
