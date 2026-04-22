import React from "react";
import { Send, MessageCircle, Instagram, ArrowUpRight } from "lucide-react";
import SectionTitle from "../components/SectionTitle";

export default function ContactPage({ t }) {
  const items = [
    {
      icon: Send,
      title: t.telegram,
      value: "SneakersClub",
      href: "https://t.me/SneakersClubSyria",
    },
    {
      icon: MessageCircle,
      title: t.whatsapp,
      value: "+963 936 769 140",
      href: "https://wa.me/963936769140",
    },
    {
      icon: Instagram,
      title: t.instagram,
      value: "Sneakersclub_Syria",
      href: "https://www.instagram.com/sneakersclub_syria?igsh=YTJyYmF3ZWN3MDlu&utm_source=qr",
    },
  ];

  return (
    <div className="container-mobile space-y-6 pb-16 pt-5">
      <SectionTitle
        eyebrow={t.contact}
        title={t.contactTitle}
        subtitle={t.contactSubtitle}
      />

      <div className="overflow-hidden rounded-[34px] border border-zinc-200 bg-white shadow-soft">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-gradient-to-br from-black via-zinc-900 to-zinc-800 p-7 text-white lg:p-9">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
              {t.brand}
            </p>
            <h3 className="mt-3 text-3xl font-black tracking-tight">
              Let’s stay connected
            </h3>
            <p className="mt-4 text-sm leading-7 text-zinc-300">
              Reach out through your preferred channel for questions, orders,
              updates, or collaborations.
            </p>
          </div>

          <div className="grid gap-4 p-6 lg:grid-cols-3 lg:p-7">
            {items.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[28px] border border-zinc-200 bg-zinc-50 p-5 transition hover:bg-white hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl bg-white p-3">
                    <item.icon className="h-5 w-5 text-zinc-900" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <p className="mt-6 text-lg font-bold text-zinc-950">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-zinc-500">{item.value}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
