import type { CSSProperties } from "react";
import type { Category } from "../domain/types";
import { CategoryGlyph } from "./CategoryGlyph";
import { classNames } from "./classNames";
import styles from "./CategoryIcon.module.css";

type CategoryIconProps = {
  category: Pick<Category, "icon" | "colorLight" | "colorDark">;
  /** Lato in px: 32 (legende), 40 (liste), 54 (griglia), 84 (anteprima). */
  size?: 32 | 40 | 54 | 84;
  /** soft: fondo tenue e glifo colorato · solid: glifo bianco su colore pieno. */
  variant?: "soft" | "solid";
  className?: string;
};

const GLYPH = { 32: 16, 40: 19, 54: 24, 84: 38 } as const;

/** Icona categoria a "squircle"; il colore segue il tema (chiaro o scuro) via CSS. */
export function CategoryIcon({
  category,
  size = 40,
  variant = "soft",
  className,
}: CategoryIconProps) {
  // i colori delle categorie arrivano dal database: sono l'unica eccezione ai token
  const colors: CSSProperties = {
    "--c-light": category.colorLight,
    "--c-dark": category.colorDark,
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.32),
  };
  return (
    <span
      className={classNames(
        styles.icon,
        variant === "solid" && styles.solid,
        className,
      )}
      style={colors}
      aria-hidden
    >
      <CategoryGlyph
        name={category.icon}
        size={GLYPH[size]}
        strokeWidth={2.2}
      />
    </span>
  );
}
