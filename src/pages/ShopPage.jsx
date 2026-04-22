import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import ProductCard from "../components/ProductCard";

export default function ShopPage({ t, products, search, setSearch, category, setCategory, sortBy, setSortBy }) {
  const filtered = [...products]
    .filter((product) => {
      const matchCategory = category === "all" ? true : product.category === category;
      const hay = [product.name, product.brand, product.category].join(" ").toLowerCase();
      const matchSearch = hay.includes(search.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return Number(a.price) - Number(b.price);
      if (sortBy === "price-high") return Number(b.price) - Number(a.price);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  return (
    <div className="container-mobile space-y-6 pb-16 pt-5">
      <SectionTitle eyebrow={t.store} title={t.shopCollection} subtitle={t.browseSubtitle} />

      <div className="card p-4 lg:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_auto_auto] lg:items-center">
          <div className="flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-3">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["all", t.filterAll],
              ["sneakers", t.filterSneakers],
              ["cloth", t.filterCloth],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  category === key ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-zinc-50 px-4 py-3 lg:min-w-[210px]">
            <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="price-low">{t.sortPriceLow}</option>
              <option value="price-high">{t.sortPriceHigh}</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-6 text-sm text-zinc-600">{t.noProducts}</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
