import React from "react";

export default function Footer({ t }) {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="rounded-[32px] bg-zinc-950 px-6 py-7 text-white shadow-soft">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-2xl font-black tracking-tight">{t.brand}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{t.footerText}</p>
              <p className="mt-3 text-sm font-medium text-zinc-400">{t.deliverySubtitle}</p>
            </div>
            <div className="text-sm text-zinc-400">
              © 2026 {t.brand}. {t.footerCopy}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
