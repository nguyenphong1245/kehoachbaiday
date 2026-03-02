import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";
import { ThemeProvider } from "./contexts/Theme";
import { ToastProvider } from "./contexts/Toast";

// Prevent Monaco 0.55+ from using the EditContext API (Chrome 133+).
// When EditContext is available, Monaco creates a native-edit-context div
// whose default styles conflict with Tailwind Preflight (border-style: solid),
// causing visible artifacts. By hiding the API, Monaco falls back to its
// traditional textarea input which already has border: none.
Object.defineProperty(globalThis, 'EditContext', {
  get() { return undefined; },
  set() { /* block re-assignment */ },
  configurable: true,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
