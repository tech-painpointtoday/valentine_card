import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

function initLanguage() {
  if (typeof navigator === "undefined") return;
  const lang = navigator.language || navigator.languages?.[0] || "";
  const hasThai =
    (typeof lang === "string" && lang.startsWith("th")) ||
    navigator.languages?.some((l) => String(l).startsWith("th"));
  if (hasThai) {
    document.documentElement.lang = "th";
  }
}

initLanguage();
createRoot(document.getElementById("root")!).render(<App />);
  