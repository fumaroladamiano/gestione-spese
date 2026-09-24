import { Repeat } from "lucide-react";
import { useState } from "react";
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
import { RuleSheet } from "./RuleSheet";
import { useRecurringRules } from "./useRecurringRules";

/** Impostazioni → Spese ricorrenti: elenco delle regole, toccarne una la modifica. */
export function RecurringPage() {
  const t = useT();
  const locale = useLocale();
  const rules = useRecurringRules();
  const categories = useCategoryMap();
  const nameOf = useCategoryName();
  const [sheet, setSheet] = useState<{
    open: boolean;
    session: number;
    rule: RecurringRule | null;
  }>({ open: false, session: 0, rule: null });

  const categoryNameOf = (rule: RecurringRule) => {
    const category = categories.get(rule.categoryId);
    return category ? nameOf(category) : "";
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
                  setSheet((current) => ({
                    open: true,
                    session: current.session + 1,
                    rule,
                  }));
                }}
              >
                {category ? (
                  <CategoryIcon category={category} size={40} />
                ) : null}
                <span className={styles.main}>
                  <span className={styles.title}>
                    {rule.note || categoryNameOf(rule)}
                  </span>
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

      {sheet.rule ? (
        <RuleSheet
          key={sheet.session}
          open={sheet.open}
          rule={sheet.rule}
          categoryName={categoryNameOf(sheet.rule)}
          onClose={() => {
            setSheet((current) => ({ ...current, open: false }));
          }}
        />
      ) : null}
    </Page>
  );
}
