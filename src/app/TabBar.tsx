import {
  ChartPie,
  House,
  List,
  Plus,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router";
import { classNames } from "../components/classNames";
import type { TextKey } from "../i18n";
import { useT } from "../i18n/useT";
import styles from "./TabBar.module.css";

type Tab = { to: string; label: TextKey; icon: LucideIcon };

const LEFT_TABS: Tab[] = [
  { to: "/", label: "tabHome", icon: House },
  { to: "/history", label: "tabHistory", icon: List },
];
const RIGHT_TABS: Tab[] = [
  { to: "/charts", label: "tabCharts", icon: ChartPie },
  { to: "/settings", label: "tabSettings", icon: SlidersHorizontal },
];

type TabBarProps = {
  onAdd: () => void;
};

/** Tab bar sospesa: 4 sezioni e il pulsante "+" centrale per una nuova spesa. */
export function TabBar({ onAdd }: TabBarProps) {
  const t = useT();

  const renderTab = ({ to, label, icon: Icon }: Tab) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        classNames(styles.tab, isActive && styles.active)
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={23} strokeWidth={isActive ? 2.3 : 1.9} aria-hidden />
          <span>{t(label)}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <nav className={styles.bar} aria-label={t("mainNavigation")}>
      {LEFT_TABS.map(renderTab)}
      <button
        type="button"
        className={styles.add}
        aria-label={t("addExpense")}
        onClick={onAdd}
      >
        <span className={styles.addCircle}>
          <Plus size={26} strokeWidth={2.6} aria-hidden />
        </span>
      </button>
      {RIGHT_TABS.map(renderTab)}
    </nav>
  );
}
