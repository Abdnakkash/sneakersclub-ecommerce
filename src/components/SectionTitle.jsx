import React from "react";

export default function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm leading-6 text-zinc-600">{subtitle}</p> : null}
    </div>
  );
}
