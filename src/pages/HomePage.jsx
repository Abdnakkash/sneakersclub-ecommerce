import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Star, ArrowRight, Search, Sparkles } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import ProductCard from "../components/ProductCard";
import logo from "../assets/logo.jpg";

export default function HomePage({ t, products, setCategory }) {
  const featured = products.slice(0, 8);

  return (
    <div className="space-y-14 pb-16">
      <section className="container-mobile pt-5">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-br from-black via-zinc-900 to-zinc-800 p-6 text-white shadow-soft lg:min-h-[560px] lg:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                <Sparkles className="h-3.5 w-3.5" />
                SneakersClub
              </div>

              <div className="mt-7 flex items-center gap-4">
                <img
                  src={logo}
                  alt="SneakersClub logo"
                  className="h-20 w-20 rounded-full border border-white/10 object-cover shadow-xl lg:h-24 lg:w-24"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{t.brand}</p>
                  <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight lg:text-6xl">
                    {t.heroTitle}
                  </h1>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 lg:text-base">
                {t.heroSubtitle}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/shop" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-zinc-950">
                  {t.shopNow}
                </Link>
                <Link to="/about" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white">
                  {t.aboutUs}
                </Link>
              </div>

              <div className="mt-auto grid grid-cols-3 gap-3 pt-8">
                {[
                  { icon: ShieldCheck, label: t.trustedQuality },
                  { icon: Truck, label: t.fastOrders },
                  { icon: Star, label: t.topModels },
                ].map((item) => (
                  <div key={item.label} className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <item.icon className="h-5 w-5 text-white" />
                    <p className="mt-3 text-sm font-semibold text-white">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl bg-zinc-100 p-3">
                  <Search className="h-5 w-5 text-zinc-900" />
                </div>
                <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900">
                  {t.shop}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.25em] text-zinc-500">{t.store}</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-zinc-950">{t.shopCollection}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">{t.browseSubtitle}</p>
            </div>

            <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-soft">
              <div className="rounded-2xl bg-zinc-100 p-3 w-fit">
                <Truck className="h-5 w-5 text-zinc-900" />
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.25em] text-zinc-500">{t.deliveryTitle}</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-zinc-950">{t.deliverySubtitle}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">{t.deliveryCardText}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link to="/shop" onClick={() => setCategory("sneakers")} className="group overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-soft">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=900&q=80"
                    alt={t.sneakers}
                    className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4">
                    <p className="text-lg font-bold text-white">{t.sneakers}</p>
                    <p className="mt-1 text-xs text-zinc-200">{t.latestDrops}</p>
                  </div>
                </div>
              </Link>

              <Link to="/shop" onClick={() => setCategory("cloth")} className="group overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-soft">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80"
                    alt={t.cloth}
                    className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4">
                    <p className="text-lg font-bold text-white">{t.cloth}</p>
                    <p className="mt-1 text-xs text-zinc-200">{t.premiumFits}</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-mobile">
        <SectionTitle eyebrow={t.featured} title={t.bestSellers} subtitle={t.sampleNotice} />
        {featured.length === 0 ? (
          <div className="card p-6 text-sm text-zinc-600">{t.noProducts}</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} t={t} />
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link to="/shop" className="inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white shadow-soft">
            {t.viewFullCollection}
          </Link>
        </div>
      </section>
    </div>
  );
}
