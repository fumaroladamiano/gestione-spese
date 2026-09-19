import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { syncDocumentWithPrefs } from "./app/preferences";
import { router } from "./app/router";
import { startApp } from "./app/startup";
import "./styles/global.css";

syncDocumentWithPrefs();
void startApp();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
