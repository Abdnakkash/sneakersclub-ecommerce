import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import { currency, decreaseStock, normalizeStock } from "../lib/helpers";
import { sendOrderNotifications } from "../lib/notify";
import { supabase, hasSupabaseEnv } from "../lib/supabase";

export default function CheckoutPage({ t, checkout, clearCheckout, refreshProducts }) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    full_name: "",
    phone: "",
    city: "",
    address: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState(null);

  const activeOrder = useMemo(() => submittedOrder || checkout, [submittedOrder, checkout]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(async () => {
      clearCheckout();
      if (refreshProducts) await refreshProducts();
      navigate("/");
    }, 2600);
    return () => clearTimeout(timer);
  }, [message, clearCheckout, navigate, refreshProducts]);

  if (!activeOrder?.product || !activeOrder?.size) {
    return (
      <div className="container-mobile py-8">
        <div className="card p-6 text-sm text-zinc-600">{t.noSelectedProduct}</div>
      </div>
    );
  }

  const product = activeOrder.product;

  const updateProductStockAfterSale = async () => {
    const currentStock = normalizeStock(product.stock_by_size || []);
    const nextStock = decreaseStock(currentStock, activeOrder.size);

    if (nextStock.length === 0) {
      return await supabase
        .from("products")
        .update({ stock_by_size: [], sizes: [], is_active: false })
        .eq("id", product.id);
    }

    return await supabase
      .from("products")
      .update({
        stock_by_size: nextStock,
        sizes: nextStock.map((item) => item.size),
        is_active: true
      })
      .eq("id", product.id);
  };

  const submitOrder = async () => {
    if (!hasSupabaseEnv) {
      setMessage("Supabase environment variables are missing.");
      return;
    }

    setSaving(true);
    setMessage("");

    const costPrice = Number(product.cost_price || 0);
    const salePrice = Number(product.price || 0);
    const orderPayload = {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      size: activeOrder.size,
      price: salePrice,
      cost_price: costPrice,
      profit: salePrice - costPrice,
      full_name: customer.full_name,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      note: customer.note,
      status: "pending",
    };

    const { error: orderError } = await supabase.from("orders").insert(orderPayload);

    if (orderError) {
      setSaving(false);
      setMessage(t.orderFailed);
      return;
    }

    const { error: stockError } = await updateProductStockAfterSale();
    setSaving(false);

    if (stockError) {
      setMessage(t.orderFailed);
      return;
    }

    await sendOrderNotifications({
      product: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: salePrice,
        cost_price: costPrice,
        image_url: product.image_url,
      },
      order: orderPayload,
      customer,
      size: activeOrder.size,
    });

    setSubmittedOrder(activeOrder);
    setCustomer({
      full_name: "",
      phone: "",
      city: "",
      address: "",
      note: "",
    });
    setMessage(t.orderSent);
  };

  return (
    <div className="container-mobile space-y-5 pb-16 pt-4 lg:space-y-6">
      <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2 px-4 py-2" disabled={saving}>
        <ArrowLeft className="h-4 w-4" /> {t.back}
      </button>

      <SectionTitle eyebrow={t.checkout} title={t.completeOrder} subtitle={t.checkoutSubtitle} />

      <div className="card p-4">
        <div className="flex gap-3">
          <img
            src={product.image_url || "https://via.placeholder.com/300x300?text=SneakersClub"}
            alt={product.name}
            className="h-24 w-24 rounded-2xl object-cover"
            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300x300?text=SneakersClub"; }}
          />
          <div>
            <h3 className="font-semibold text-zinc-900">{product.name}</h3>
            <p className="mt-1 text-sm text-zinc-500">{t.sizeLabel}: {activeOrder.size}</p>
            <p className="mt-2 text-lg font-bold text-zinc-950">{currency(product.price)}</p>
          </div>
        </div>
      </div>

      <div className="card space-y-3 p-4">
        {[
          ["full_name", t.fullName, "text"],
          ["phone", t.phone, "tel"],
          ["city", t.city, "text"],
          ["address", t.address, "text"],
        ].map(([key, label, type]) => (
          <div key={key}>
            <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
            <input
              type={type}
              value={customer[key]}
              onChange={(e) => setCustomer((prev) => ({ ...prev, [key]: e.target.value }))}
              className="input"
              placeholder={label}
              disabled={Boolean(message)}
            />
          </div>
        ))}

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">{t.note}</label>
          <textarea
            rows={4}
            value={customer.note}
            onChange={(e) => setCustomer((prev) => ({ ...prev, note: e.target.value }))}
            className="input"
            placeholder={t.extraDetails}
            disabled={Boolean(message)}
          />
        </div>

        <button
          onClick={submitOrder}
          disabled={saving || Boolean(message) || !customer.full_name || !customer.phone || !customer.city || !customer.address}
          className={`w-full rounded-full px-5 py-4 text-sm font-bold transition ${
            !saving && !message && customer.full_name && customer.phone && customer.city && customer.address
              ? "bg-green-600 text-white"
              : "bg-zinc-200 text-zinc-500"
          }`}
        >
          {saving ? "..." : t.placeOrder}
        </button>

        {message ? (
          <div className="space-y-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-semibold text-green-700">
            <div>{message}</div>
            <div className="text-xs font-medium text-green-700/90">{t.adminEmailNotice}</div>
            <div className="text-xs font-medium text-green-700/90">{t.orderCustomerNotice}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
