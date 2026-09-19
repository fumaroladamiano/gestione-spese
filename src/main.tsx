import { LazyMotion } from "motion/react";
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
    {/* strict: vieta i componenti motion completi, così il pacchetto iniziale resta leggero */}
    <LazyMotion
      features={() =>
        import("./app/motionFeatures").then((module) => module.default)
      }
      strict
    >
      <RouterProvider router={router} />
    </LazyMotion>
  </StrictMode>,
);
