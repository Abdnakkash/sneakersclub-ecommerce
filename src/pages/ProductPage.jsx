import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { currency, normalizeStock, getQuantityForSize } from "../lib/helpers";

export default function ProductPage({ t, products, setCheckout }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = useMemo(
    () => products.find((item) => String(item.slug || item.id) === String(slug)),
    [products, slug]
  );
  const [size, setSize] = useState("");

  if (!product) {
    return <div className="container-mobile py-8 text-sm text-zinc-600">{t.noProducts}</div>;
  }

  const stock = normalizeStock(product.stock_by_size || []);
  const sizes = stock.map((item) => item.size);

  return (
    <div className="pb-16">
      <div className="sticky top-[96px] z-20 bg-[#f4f4f5]/80 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2 px-4 py-2">
            <ArrowLeft className="h-4 w-4" /> {t.back}
          </button>
        </div>
      </div>

      <div className="container-mobile pt-4 lg:pt-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-soft">
            <img
              src={product.image_url || "https://via.placeholder.com/900x1000?text=SneakersClub"}
              alt={product.name}
              className="aspect-[4/4.4] w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/900x1000?text=SneakersClub";
              }}
            />
          </div>

          <div className="card p-6 lg:sticky lg:top-32">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{product.brand}</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">{product.name}</h2>
              </div>
              <p className="text-2xl font-black text-zinc-950">{currency(product.price)}</p>
            </div>

            <p className="mt-5 text-sm leading-7 text-zinc-600">{product.description}</p>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-900">{t.availableSizes}</p>
                <p className="text-xs text-zinc-500">{t.stockBySize}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {sizes.map((item) => (
                  <button
                    key={item}
                    onClick={() => setSize(String(item))}
                    className={`min-w-[78px] rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      size === String(item)
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <div>{item}</div>
                    <div className={`mt-1 text-[11px] ${size === String(item) ? "text-zinc-300" : "text-zinc-500"}`}>
                      {t.quantity}: {getQuantityForSize(stock, item)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!size}
              onClick={() => {
                setCheckout({ product, size });
                navigate("/checkout");
              }}
              className={`mt-7 w-full rounded-full px-5 py-4 text-sm font-bold transition ${
                size ? "bg-zinc-950 text-white" : "bg-zinc-200 text-zinc-500"
              }`}
            >
              {size ? t.buyNow : t.selectSizeFirst}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
