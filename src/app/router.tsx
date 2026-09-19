import { createHashRouter } from "react-router";
import { ChartsPage } from "../features/charts/ChartsPage";
import { HistoryPage } from "../features/history/HistoryPage";
import { HomePage } from "../features/home/HomePage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { AppLayout } from "./AppLayout";

// Indirizzi del tipo https://utente.github.io/gestione-spese/#/history:
// GitHub Pages riceve sempre /gestione-spese/ e non restituisce mai 404 sulle pagine interne.
export const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "charts", element: <ChartsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <HomePage /> },
    ],
  },
]);
