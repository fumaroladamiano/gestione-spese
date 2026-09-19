import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { syncDocumentWithPrefs } from "./app/preferences";
import "./styles/global.css";

syncDocumentWithPrefs();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
