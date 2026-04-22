import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { currency, normalizeStock } from "../lib/helpers";

export default function ProductCard({ product, t }) {
  const stock = normalizeStock(product.stock_by_size || []);
  const totalQty = stock.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const stockLabel = totalQty === 0 ? t.outOfStock : totalQty <= 2 ? t.lowStock : t.inStock;

  return (
    <motion.div whileTap={{ scale: 0.985 }} className="overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-soft">
      <Link to={`/product/${product.slug || product.id}`}>
        <div className="relative aspect-[4/4.7] overflow-hidden">
          <img
            src={product.image_url || "https://via.placeholder.com/600x700?text=SneakersClub"}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/600x700?text=SneakersClub"; }}
          />
          <div className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-[11px] font-medium text-white">
            {product.category === "sneakers" ? t.sneakers : t.cloth}
          </div>
          <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-zinc-900 backdrop-blur">
            {stockLabel}
          </div>
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-sm font-bold text-zinc-900">{product.name}</h3>
              <p className="text-xs text-zinc-500">{product.brand}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base font-black text-zinc-950">{currency(product.price)}</p>
            <p className="text-xs text-zinc-500">{t.tapToView}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
