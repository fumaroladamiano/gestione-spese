import { createHashRouter } from "react-router";
import { HomePage } from "../features/home/HomePage";
import { AppLayout } from "./AppLayout";

// Indirizzi del tipo https://utente.github.io/gestione-spese/#/history:
// GitHub Pages riceve sempre /gestione-spese/ e non restituisce mai 404 sulle pagine interne.
// La Home è nel pacchetto iniziale; le altre sezioni si caricano alla prima apertura
// (sono comunque tutte nella cache del service worker, quindi funzionano offline).
export const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "history",
        lazy: async () => ({
          Component: (await import("../features/history/HistoryPage"))
            .HistoryPage,
        }),
      },
      {
        path: "charts",
        lazy: async () => ({
          Component: (await import("../features/charts/ChartsPage")).ChartsPage,
        }),
      },
      {
        path: "settings",
        lazy: async () => ({
          Component: (await import("../features/settings/SettingsPage"))
            .SettingsPage,
        }),
      },
      {
        path: "settings/categories",
        lazy: async () => ({
          Component: (await import("../features/categories/CategoriesPage"))
            .CategoriesPage,
        }),
      },
      {
        path: "settings/recurring",
        lazy: async () => ({
          Component: (await import("../features/recurring/RecurringPage"))
            .RecurringPage,
        }),
      },
      { path: "*", element: <HomePage /> },
    ],
  },
]);
