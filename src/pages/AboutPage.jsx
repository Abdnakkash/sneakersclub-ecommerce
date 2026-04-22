import React from "react";
import { Truck, ShieldCheck, Sparkles } from "lucide-react";
import SectionTitle from "../components/SectionTitle";

export default function AboutPage({ t }) {
  const items = [
    { icon: ShieldCheck, title: t.trustedQuality, text: t.aboutQualityText },
    { icon: Truck, title: t.deliveryTitle, text: t.deliverySubtitle },
    { icon: Sparkles, title: t.topModels, text: t.aboutTopModelsText },
  ];

  return (
    <div className="container-mobile space-y-6 pb-16 pt-5">
      <SectionTitle eyebrow={t.about} title={t.aboutTitle} subtitle={t.aboutSubtitle} />

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-[34px] border border-zinc-200 bg-white shadow-soft">
          <div className="bg-gradient-to-br from-black via-zinc-900 to-zinc-800 p-7 text-white lg:p-9">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{t.brand}</p>
            <h3 className="mt-3 text-3xl font-black tracking-tight">Premium store experience</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300">{t.aboutCardIntro}</p>
          </div>
          <div className="grid gap-4 p-6 lg:grid-cols-3 lg:p-7">
            {items.map((item) => (
              <div key={item.title} className="rounded-[24px] bg-zinc-100 p-4">
                <div className="rounded-2xl bg-white p-3 w-fit">
                  <item.icon className="h-5 w-5 text-zinc-900" />
                </div>
                <p className="mt-4 text-sm font-bold text-zinc-950">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[30px] border border-zinc-200 bg-white p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{t.about}</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-zinc-950">Why SneakersClub</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-600">
              Built to combine modern design, premium product presentation, and smooth ordering in one clean store experience.
            </p>
          </div>

          <div className="rounded-[30px] border border-zinc-200 bg-white p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{t.deliveryTitle}</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-zinc-950">{t.deliverySubtitle}</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-600">
              Orders are handled in a simple and direct flow with product details, size selection, order capture, and admin management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
