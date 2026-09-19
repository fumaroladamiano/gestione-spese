import { Repeat } from "lucide-react";
import { useState } from "react";
import { ActionSheet } from "../../components/ActionSheet";
import { CategoryIcon } from "../../components/CategoryIcon";
import { classNames } from "../../components/classNames";
import { EmptyState } from "../../components/EmptyState";
import { ListGroup } from "../../components/ListGroup";
import { Page } from "../../components/Page";
import { formatAmount } from "../../domain/money";
import type { RecurringRule } from "../../domain/types";
import { useLocale, useT } from "../../i18n/useT";
import { useCategoryMap, useCategoryName } from "../categories/useCategories";
import styles from "./RecurringPage.module.css";
import { useRecurringRules, useRuleActions } from "./useRecurringRules";

/** Impostazioni → Spese ricorrenti: elenco delle regole con sospendi, riattiva, elimina. */
export function RecurringPage() {
  const t = useT();
  const locale = useLocale();
  const rules = useRecurringRules();
  const categories = useCategoryMap();
  const nameOf = useCategoryName();
  const actions = useRuleActions();
  const [selected, setSelected] = useState<RecurringRule | null>(null);

  const titleOf = (rule: RecurringRule) => {
    const category = categories.get(rule.categoryId);
    return rule.note || (category ? nameOf(category) : "");
  };

  return (
    <Page
      title={t("recurringTitle")}
      back={{
        label: t("settingsTitle"),
        to: "/settings",
        ariaLabel: t("back", t("settingsTitle")),
      }}
    >
      {rules?.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title={t("recurringTitle")}
          message={t("recurringEmpty")}
        />
      ) : null}
      {rules && rules.length > 0 ? (
        <ListGroup footer={t("recurringFooter")}>
          {rules.map((rule) => {
            const category = categories.get(rule.categoryId);
            return (
              <button
                key={rule.id}
                type="button"
                className={classNames(
                  styles.row,
                  !rule.active && styles.paused,
                )}
                onClick={() => {
                  setSelected(rule);
                }}
              >
                {category ? (
                  <CategoryIcon category={category} size={40} />
                ) : null}
                <span className={styles.main}>
                  <span className={styles.title}>{titleOf(rule)}</span>
                  <span className={styles.subtitle}>
                    {t(
                      "ruleSummary",
                      formatAmount(rule.amountCents, locale),
                      rule.dayOfMonth,
                    )}
                  </span>
                </span>
                <span
                  className={classNames(
                    styles.status,
                    rule.active && styles.active,
                  )}
                >
                  {rule.active ? t("ruleActive") : t("ruleSuspended")}
                </span>
              </button>
            );
          })}
        </ListGroup>
      ) : null}

      <ActionSheet
        open={selected !== null}
        title={selected ? titleOf(selected) : ""}
        message={t("recurringFooter")}
        actions={
          selected
            ? [
                {
                  label: selected.active ? t("suspendRule") : t("resumeRule"),
                  onSelect: () => {
                    setSelected(null);
                    void actions.toggle(selected);
                  },
                },
                {
                  label: t("deleteRule"),
                  destructive: true,
                  onSelect: () => {
                    setSelected(null);
                    void actions.remove(selected);
                  },
                },
              ]
            : []
        }
        cancelLabel={t("cancel")}
        onCancel={() => {
          setSelected(null);
        }}
      />
    </Page>
  );
}
