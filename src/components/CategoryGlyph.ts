import {
  BookOpen,
  Briefcase,
  Car,
  Coffee,
  Dumbbell,
  Ellipsis,
  Gift,
  Heart,
  House,
  Plane,
  Repeat,
  Shirt,
  ShoppingCart,
  Star,
  Utensils,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { createElement } from "react";
import { isCategoryIcon, type CategoryIconName } from "../domain/categories";

/**
 * Unico punto in cui il nome salvato dell'icona diventa un'icona Lucide:
 * se un giorno cambia la libreria, dati e backup restano validi.
 */
const CATEGORY_ICON_COMPONENTS: Record<CategoryIconName, LucideIcon> = {
  cart: ShoppingCart,
  car: Car,
  food: Utensils,
  home: House,
  heart: Heart,
  star: Star,
  repeat: Repeat,
  dots: Ellipsis,
  gift: Gift,
  plane: Plane,
  book: BookOpen,
  dumbbell: Dumbbell,
  shirt: Shirt,
  coffee: Coffee,
  briefcase: Briefcase,
};

function categoryIconComponent(name: string): LucideIcon {
  return isCategoryIcon(name) ? CATEGORY_ICON_COMPONENTS[name] : Ellipsis;
}

type CategoryGlyphProps = LucideProps & { name: string };

/** Glifo Lucide di una categoria a partire dal nome salvato (es. "cart"). */
export function CategoryGlyph({ name, ...props }: CategoryGlyphProps) {
  return createElement(categoryIconComponent(name), props);
}
