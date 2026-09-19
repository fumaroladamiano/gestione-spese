import { Sparkles } from "lucide-react";
import { Chip } from "../../components/Chip";
import { useT } from "../../i18n/useT";
import { useCategoryMap, useCategoryName } from "../categories/useCategories";
import styles from "./CategorySuggestion.module.css";
import { useCategorySuggestion } from "./useCategorySuggestion";

type CategorySuggestionProps = {
  note: string;
  onSelect: (categoryId: string) => void;
};

/**
 * Se la nota è già stata usata, propone la categoria dell'ultima volta.
 * È solo un suggerimento da toccare: nessuna categoria viene scelta da sola (decisione D4).
 */
export function CategorySuggestion({
  note,
  onSelect,
}: CategorySuggestionProps) {
  const t = useT();
  const categories = useCategoryMap();
  const nameOf = useCategoryName();
  const suggestedId = useCategorySuggestion(note);
  const category = suggestedId ? categories.get(suggestedId) : undefined;
  if (!category || category.archived) return null;

  return (
    <div className={styles.suggestion}>
      <Chip
        variant="soft"
        icon={Sparkles}
        label={t("categorySuggestion", nameOf(category))}
        dot={{ light: category.colorLight, dark: category.colorDark }}
        onClick={() => {
          onSelect(category.id);
        }}
      />
    </div>
  );
}
