import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import { translations } from "./data/translations";
import { supabase, hasSupabaseEnv } from "./lib/supabase";

const sampleProducts = [
  {
    id: "sample-1",
    slug: "nike-air-max-plus",
    name: "Nike Air Max Plus",
    brand: "Nike",
    category: "sneakers",
    price: 160,
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    description: "Premium everyday sneaker with comfort cushioning and a strong street look.",
    stock_by_size: [{ size: "40", quantity: 2 }, { size: "41", quantity: 1 }, { size: "42", quantity: 3 }],
    sizes: ["40","41","42"],
    is_active: true
  }
];

export default function App() {
  const [lang, setLang] = useState("en");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState([]);
  const [checkout, setCheckout] = useState(null);

  const t = useMemo(() => translations[lang], [lang]);

  const refreshProducts = async () => {
    if (!hasSupabaseEnv) {
      setProducts(sampleProducts.filter((item) => item.is_active));
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      setProducts([]);
      return;
    }

    setProducts(data || []);
  };

  const clearCheckout = () => setCheckout(null);

  useEffect(() => {
    refreshProducts();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <Navbar t={t} lang={lang} setLang={setLang} />
      <main className="mx-auto min-h-[calc(100vh-180px)] max-w-7xl">
        <Routes>
          <Route path="/" element={<HomePage t={t} products={products} setCategory={setCategory} />} />
          <Route
            path="/shop"
            element={
              <ShopPage
                t={t}
                products={products}
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            }
          />
          <Route path="/product/:slug" element={<ProductPage t={t} products={products} setCheckout={setCheckout} />} />
          <Route path="/checkout" element={<CheckoutPage t={t} checkout={checkout} clearCheckout={clearCheckout} refreshProducts={refreshProducts} />} />
          <Route path="/about" element={<AboutPage t={t} />} />
          <Route path="/contact" element={<ContactPage t={t} />} />
          <Route path="/admin-login" element={<AdminPage t={t} refreshProducts={refreshProducts} />} />
        </Routes>
      </main>
      <Footer t={t} />
    </div>
  );
}
