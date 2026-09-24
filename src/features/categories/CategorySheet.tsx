import { Check } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { CategoryGlyph } from "../../components/CategoryGlyph";
import { CategoryIcon } from "../../components/CategoryIcon";
import { classNames } from "../../components/classNames";
import { Sheet } from "../../components/Sheet";
import { SheetHeader } from "../../components/SheetHeader";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  FALLBACK_CATEGORY_ID,
} from "../../domain/categories";
import { LIMITS, type Category } from "../../domain/types";
import { useT } from "../../i18n/useT";
import { useActiveRuleCount } from "../recurring/useRecurringRules";
import styles from "./CategorySheet.module.css";
import { useCategoryActions } from "./useCategoryActions";
import { useCategoryName } from "./useCategories";

type CategorySheetProps = {
  open: boolean;
  /** Categoria da modificare, oppure null per crearne una nuova. Letta solo all'apertura. */
  category: Category | null;
  expenseCount: number;
  onClose: () => void;
};

const DEFAULT_COLOR = CATEGORY_COLORS[8];

/** Foglio categoria: nome, colore, icona e archiviazione o eliminazione. */
export function CategorySheet({
  open,
  category,
  expenseCount,
  onClose,
}: CategorySheetProps) {
  const t = useT();
  const nameOf = useCategoryName();
  const actions = useCategoryActions();
  const activeRules = useActiveRuleCount(category?.id ?? null);
  const [name, setName] = useState(() => (category ? nameOf(category) : ""));
  const [icon, setIcon] = useState(() => category?.icon ?? "gift");
  const [color, setColor] = useState(() => ({
    light: category?.colorLight ?? DEFAULT_COLOR.light,
    dark: category?.colorDark ?? DEFAULT_COLOR.dark,
  }));

  const style = { icon, colorLight: color.light, colorDark: color.dark };
  const valid = name.trim().length > 0;

  const save = async () => {
    if (!valid) return;
    const ok = category
      ? await actions.update(category.id, name, style)
      : await actions.create(name, style);
    if (ok) onClose();
  };

  // chiude il foglio solo se l'azione è riuscita (altrimenti resta aperto con il toast d'errore)
  const closeIfDone = (action: Promise<boolean>) => {
    void action.then((ok) => {
      if (ok) onClose();
    });
  };

  const footer = (() => {
    if (!category) return null;
    if (category.archived) {
      return (
        <button
          type="button"
          className={styles.restore}
          onClick={() => {
            closeIfDone(actions.restore(category));
          }}
        >
          {t("restoreCategory")}
        </button>
      );
    }
    if (category.id === FALLBACK_CATEGORY_ID) {
      return <p className={styles.note}>{t("otherNotArchivable")}</p>;
    }
    if (!category.builtin && expenseCount === 0) {
      return (
        <button
          type="button"
          className={styles.danger}
          onClick={() => {
            closeIfDone(actions.remove(category));
          }}
        >
          {t("deleteCategory")}
        </button>
      );
    }
    return (
      <>
        <button
          type="button"
          className={styles.danger}
          onClick={() => {
            closeIfDone(actions.archive(category));
          }}
        >
          {t("archiveCategory")}
        </button>
        {expenseCount > 0 ? (
          <p className={styles.note}>{t("keepExpenses", expenseCount)}</p>
        ) : null}
        {activeRules > 0 ? (
          <p className={styles.note}>
            {t("rulesSuspendedByArchive", activeRules)}
          </p>
        ) : null}
      </>
    );
  })();

  const title = category ? t("editCategory") : t("newCategory");

  return (
    <Sheet
      open={open}
      onRequestClose={onClose}
      label={title}
      header={
        <SheetHeader
          title={title}
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={t("save")}
          actionEnabled={valid}
          onAction={() => void save()}
        />
      }
    >
      <div className={styles.preview}>
        <CategoryIcon
          category={{ icon, colorLight: color.light, colorDark: color.dark }}
          size={84}
          variant="solid"
        />
      </div>
      <input
        className={styles.name}
        aria-label={t("categoryName")}
        placeholder={t("categoryNamePlaceholder")}
        maxLength={LIMITS.categoryNameLength}
        autoComplete="off"
        enterKeyHint="done"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
            void save();
          }
        }}
      />

      <h3 className={styles.title}>{t("color")}</h3>
      <div
        className={classNames(styles.card, styles.grid)}
        role="radiogroup"
        aria-label={t("color")}
      >
        {CATEGORY_COLORS.map((option, index) => {
          const selected = option.light === color.light;
          const swatch: CSSProperties = {
            "--c-light": option.light,
            "--c-dark": option.dark,
          };
          return (
            <button
              key={option.light}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={t("colorN", index + 1)}
              className={classNames(styles.swatch, selected && styles.selected)}
              style={swatch}
              onClick={() => {
                setColor(option);
              }}
            >
              {selected ? (
                <Check size={16} strokeWidth={3} aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>

      <h3 className={styles.title}>{t("icon")}</h3>
      <div
        className={classNames(styles.card, styles.grid)}
        role="radiogroup"
        aria-label={t("icon")}
      >
        {CATEGORY_ICONS.map((option, index) => {
          const selected = option === icon;
          const tint: CSSProperties = {
            "--c-light": color.light,
            "--c-dark": color.dark,
          };
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={t("iconN", index + 1)}
              className={classNames(
                styles.iconOption,
                selected && styles.iconSelected,
              )}
              style={tint}
              onClick={() => {
                setIcon(option);
              }}
            >
              <CategoryGlyph
                name={option}
                size={22}
                strokeWidth={2}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </Sheet>
  );
}
