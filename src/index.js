import ReactDOM from "react-dom/client";

import App from "./app/App";

import { AppProviders } from "./app/providers";

import "./utils/i18n";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AppProviders>
    <App />
  </AppProviders>,
);
