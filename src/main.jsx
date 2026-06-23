import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./i18n/index.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// Set initial lang direction
const lang = localStorage.getItem("lang") || "en";
document.documentElement.lang = lang;
document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
