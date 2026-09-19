import type { BuiltinCategoryId } from "../domain/categories";
import { isBuiltinCategoryId } from "../domain/categories";
import type { Category, PaymentMethod } from "../domain/types";
import type { TextKey, Translate } from "./dictionary";
import { createT, LANGUAGES } from "./index";

const BUILTIN_CATEGORY_TEXT: Record<BuiltinCategoryId, TextKey> = {
  spesa: "categoryGroceries",
  trasporti: "categoryTransport",
  ristoranti: "categoryRestaurants",
  casa: "categoryHome",
  salute: "categoryHealth",
  svago: "categoryLeisure",
  abbonamenti: "categorySubscriptions",
  lavoro: "categoryWork",
  altro: "categoryOther",
};

const PAYMENT_TEXT: Record<PaymentMethod, TextKey> = {
  carta: "paymentCard",
  contanti: "paymentCash",
  altro: "paymentOther",
};

/**
 * Nome mostrato: quello scelto dall'utente, oppure la traduzione per le
 * predefinite mai rinominate (name === null).
 */
export function categoryDisplayName(category: Category, t: Translate): string {
  if (category.name !== null) return category.name;
  return isBuiltinCategoryId(category.id)
    ? t(BUILTIN_CATEGORY_TEXT[category.id])
    : category.id;
}

/** Nome di una predefinita in tutte le lingue (per il seed e l'unicità dei nomi). */
export function builtinNamesInAllLanguages(id: BuiltinCategoryId): string[] {
  return LANGUAGES.map((language) =>
    createT(language)(BUILTIN_CATEGORY_TEXT[id]),
  );
}

export function paymentMethodName(method: PaymentMethod, t: Translate): string {
  return t(PAYMENT_TEXT[method]);
}
