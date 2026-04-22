import React from "react";

export default function LanguageToggle({ lang, setLang, t }) {
  return (
    <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="btn-secondary px-4 py-2">
      {t.language}
    </button>
  );
}
