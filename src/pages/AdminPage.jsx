import React, { useEffect, useMemo, useState } from "react";
import { supabase, hasSupabaseEnv, storageBucket } from "../lib/supabase";
import { formatDate, slugify, uniqueFileName, stockToString, stringToStock } from "../lib/helpers";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

const emptyProduct = {
  name: "",
  slug: "",
  brand: "",
  category: "sneakers",
  price: "",
  cost_price: "",
  image_url: "",
  description: "",
  stock_by_size: "",
  is_active: true,
};

function isSameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toDayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function exportOrdersCsv(orders) {
  const rows = [
    ["Date", "Product", "Category", "Size", "Price", "Cost Price", "Profit", "Customer", "Phone", "City", "Address", "Status"],
    ...orders.map((o) => [
      o.created_at || "",
      o.product_name || "",
      o.category || "",
      o.size || "",
      o.price || "",
      o.cost_price || "",
      o.profit || "",
      o.full_name || "",
      o.phone || "",
      o.city || "",
      o.address || "",
      o.status || "",
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "orders-export.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminPage({ t, refreshProducts }) {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const boot = async () => {
      if (!hasSupabaseEnv) return;
      const { data } = await supabase.auth.getSession();
      setSession(data.session || null);
    };
    boot();

    let subscription;
    if (hasSupabaseEnv) {
      const response = supabase.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession || null);
      });
      subscription = response.data.subscription;
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      loadProducts();
      loadOrders();
    }
  }, [session]);

  const parsedStock = useMemo(() => stringToStock(form.stock_by_size), [form.stock_by_size]);

  const signIn = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!hasSupabaseEnv) {
      setMessage("Supabase environment variables are missing.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const loadOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!hasSupabaseEnv) {
      setMessage("Supabase environment variables are missing.");
      return;
    }

    setUploadingImage(true);
    setMessage("");

    const safeName = uniqueFileName(file);
    const filePath = `products/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) {
      setUploadingImage(false);
      setMessage(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from(storageBucket).getPublicUrl(filePath);
    setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
    setUploadingImage(false);
    setMessage(t.imageUploaded);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setMessage("");

    const stock = parsedStock;
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      brand: form.brand,
      category: form.category,
      price: Number(form.price || 0),
      cost_price: Number(form.cost_price || 0),
      image_url: form.image_url,
      description: form.description,
      stock_by_size: stock,
      sizes: stock.map((item) => item.size),
      is_active: form.is_active && stock.length > 0,
    };

    let result;
    if (editingId) {
      result = await supabase.from("products").update(payload).eq("id", editingId);
    } else {
      result = await supabase.from("products").insert(payload);
    }

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setForm(emptyProduct);
    setEditingId(null);
    setMessage("Saved.");
    await loadProducts();
    await refreshProducts();
  };

  const editProduct = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      slug: item.slug || "",
      brand: item.brand || "",
      category: item.category || "sneakers",
      price: item.price || "",
      cost_price: item.cost_price || "",
      image_url: item.image_url || "",
      description: item.description || "",
      stock_by_size: stockToString(item.stock_by_size || []),
      is_active: item.is_active ?? true,
    });
    setTab("products");
  };

  const deleteProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    await loadProducts();
    await refreshProducts();
  };

  const updateOrderStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    await loadOrders();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const d = new Date(order.created_at);
      if (dateFrom) {
        const start = new Date(dateFrom + "T00:00:00");
        if (d < start) return false;
      }
      if (dateTo) {
        const end = new Date(dateTo + "T23:59:59");
        if (d > end) return false;
      }
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo, statusFilter]);

  const dashboard = useMemo(() => {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
    const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const startWeekNow = startOfWeek(now);
    const startWeekPrev = new Date(startWeekNow);
    startWeekPrev.setDate(startWeekPrev.getDate() - 7);
    const endWeekPrev = new Date(startWeekNow);
    endWeekPrev.setSeconds(-1);

    const todayOrders = filteredOrders.filter((o) => isSameDay(new Date(o.created_at), now));
    const monthOrders = filteredOrders.filter((o) => new Date(o.created_at) >= startMonth);
    const weekOrders = filteredOrders.filter((o) => new Date(o.created_at) >= startWeekNow);
    const prevMonthOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= startPrevMonth && d <= endPrevMonth;
    });
    const prevWeekOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= startWeekPrev && d <= endWeekPrev;
    });

    const revenueAll = filteredOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const revenueToday = todayOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const revenueMonth = monthOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const revenueWeek = weekOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const revenuePrevMonth = prevMonthOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const revenuePrevWeek = prevWeekOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);

    const profitAll = filteredOrders.reduce((sum, o) => sum + Number(o.profit || 0), 0);
    const profitMonth = monthOrders.reduce((sum, o) => sum + Number(o.profit || 0), 0);
    const profitWeek = weekOrders.reduce((sum, o) => sum + Number(o.profit || 0), 0);

    const avgOrderValue = filteredOrders.length ? revenueAll / filteredOrders.length : 0;

    const pending = filteredOrders.filter((o) => o.status === "pending").length;
    const paid = filteredOrders.filter((o) => o.status === "paid").length;
    const cancelled = filteredOrders.filter((o) => o.status === "cancelled").length;

    const productMap = {};
    const sizeMap = {};
    const cityMap = {};
    const dayMap = {};
    const monthMap = {};

    filteredOrders.forEach((o) => {
      const d = new Date(o.created_at);
      const dayKey = toDayKey(d);
      const monthKey = toMonthKey(d);

      dayMap[dayKey] = dayMap[dayKey] || { label: dayKey, revenue: 0, profit: 0, orders: 0 };
      dayMap[dayKey].revenue += Number(o.price || 0);
      dayMap[dayKey].profit += Number(o.profit || 0);
      dayMap[dayKey].orders += 1;

      monthMap[monthKey] = monthMap[monthKey] || { label: monthKey, revenue: 0, profit: 0, orders: 0 };
      monthMap[monthKey].revenue += Number(o.price || 0);
      monthMap[monthKey].profit += Number(o.profit || 0);
      monthMap[monthKey].orders += 1;

      const productKey = o.product_name || "-";
      productMap[productKey] = productMap[productKey] || { name: productKey, count: 0, revenue: 0, profit: 0 };
      productMap[productKey].count += 1;
      productMap[productKey].revenue += Number(o.price || 0);
      productMap[productKey].profit += Number(o.profit || 0);

      const sizeKey = o.size || "-";
      sizeMap[sizeKey] = sizeMap[sizeKey] || { size: sizeKey, count: 0 };
      sizeMap[sizeKey].count += 1;

      const cityKey = o.city || "-";
      cityMap[cityKey] = cityMap[cityKey] || { city: cityKey, count: 0, revenue: 0 };
      cityMap[cityKey].count += 1;
      cityMap[cityKey].revenue += Number(o.price || 0);
    });

    return {
      revenueAll,
      revenueToday,
      revenueMonth,
      revenueWeek,
      revenuePrevMonth,
      revenuePrevWeek,
      profitAll,
      profitMonth,
      profitWeek,
      todayOrders: todayOrders.length,
      monthOrders: monthOrders.length,
      weekOrders: weekOrders.length,
      avgOrderValue,
      pending,
      paid,
      cancelled,
      topProducts: Object.values(productMap).sort((a, b) => b.count - a.count).slice(0, 5),
      topSizes: Object.values(sizeMap).sort((a, b) => b.count - a.count).slice(0, 5),
      topCities: Object.values(cityMap).sort((a, b) => b.count - a.count).slice(0, 5),
      dailyData: Object.values(dayMap).sort((a, b) => a.label.localeCompare(b.label)).slice(-14),
      monthlyData: Object.values(monthMap).sort((a, b) => a.label.localeCompare(b.label)).slice(-12),
      latestOrders: [...filteredOrders].slice(0, 8),
    };
  }, [filteredOrders, orders]);

  if (!session) {
    return (
      <div className="container-mobile space-y-5 pb-12 pt-4">
        <div className="card p-5">
          <h1 className="text-2xl font-bold text-zinc-950">{t.adminLogin}</h1>
          <p className="mt-2 text-sm text-zinc-600">{t.useAdminAuth}</p>
          <form onSubmit={signIn} className="mt-5 space-y-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">{t.adminEmail}</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">{t.password}</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn-primary w-full">{t.signIn}</button>
            {message ? <p className="text-sm text-zinc-700">{message}</p> : null}
          </form>
        </div>
      </div>
    );
  }

  const compareMonth = dashboard.revenuePrevMonth
    ? (((dashboard.revenueMonth - dashboard.revenuePrevMonth) / dashboard.revenuePrevMonth) * 100).toFixed(1)
    : null;

  const compareWeek = dashboard.revenuePrevWeek
    ? (((dashboard.revenueWeek - dashboard.revenuePrevWeek) / dashboard.revenuePrevWeek) * 100).toFixed(1)
    : null;

  const statCards = [
    { label: t.todaySales, value: `$${dashboard.revenueToday.toFixed(0)}` },
    { label: t.weekSales, value: `$${dashboard.revenueWeek.toFixed(0)}` },
    { label: t.monthSales, value: `$${dashboard.revenueMonth.toFixed(0)}` },
    { label: t.netProfit, value: `$${dashboard.profitAll.toFixed(0)}` },
    { label: t.todayOrders, value: dashboard.todayOrders },
    { label: t.weekOrders, value: dashboard.weekOrders },
    { label: t.monthOrders, value: dashboard.monthOrders },
    { label: t.avgOrderValue, value: `$${dashboard.avgOrderValue.toFixed(1)}` },
    { label: t.pendingOrders, value: dashboard.pending },
    { label: t.paidOrders, value: dashboard.paid },
    { label: t.cancelledOrders, value: dashboard.cancelled },
    { label: t.totalRevenue, value: `$${dashboard.revenueAll.toFixed(0)}` },
  ];

  return (
    <div className="container-mobile space-y-5 pb-12 pt-4">
      <div className="overflow-hidden rounded-[32px] bg-zinc-950 p-5 text-white shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{t.dashboardPro}</p>
            <h1 className="mt-2 text-2xl font-black">{t.salesDashboard}</h1>
            <p className="mt-2 text-sm text-zinc-300">{session.user?.email}</p>
          </div>
          <button onClick={signOut} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">{t.signOut}</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab("dashboard")} className={tab === "dashboard" ? "btn-primary" : "btn-secondary"}>{t.dashboardTab}</button>
        <button onClick={() => setTab("products")} className={tab === "products" ? "btn-primary" : "btn-secondary"}>{t.products}</button>
        <button onClick={() => setTab("orders")} className={tab === "orders" ? "btn-primary" : "btn-secondary"}>{t.orders}</button>
      </div>

      {tab === "dashboard" ? (
        <>
          <div className="card p-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">{t.dateFrom}</label>
                <input type="date" className="input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">{t.dateTo}</label>
                <input type="date" className="input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">{t.statusFilter}</label>
                <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">{t.statusAll}</option>
                  <option value="pending">{t.pending}</option>
                  <option value="paid">{t.paid}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={() => { setDateFrom(""); setDateTo(""); setStatusFilter("all"); }} className="btn-secondary w-full">{t.resetFilter}</button>
                <button onClick={() => exportOrdersCsv(filteredOrders)} className="btn-secondary w-full">{t.exportCsv}</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {statCards.map((card) => (
              <div key={card.label} className="card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{card.label}</p>
                <p className="mt-2 text-2xl font-black text-zinc-950">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-zinc-950">{t.revenueVsProfit}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                  <span>{t.compareLastMonth}: {compareMonth === null ? "-" : `${compareMonth}%`}</span>
                  <span>{t.compareLastWeek}: {compareWeek === null ? "-" : `${compareWeek}%`}</span>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h2 className="mb-4 text-lg font-bold text-zinc-950">{t.dailyChart}</h2>
              {dashboard.dailyData.length === 0 ? (
                <p className="text-sm text-zinc-500">{t.noData}</p>
              ) : (
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <AreaChart data={dashboard.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" hide />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" strokeWidth={2} fillOpacity={0.25} />
                      <Area type="monotone" dataKey="profit" strokeWidth={2} fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="card p-4">
              <h2 className="mb-4 text-lg font-bold text-zinc-950">{t.monthlyChart}</h2>
              {dashboard.monthlyData.length === 0 ? (
                <p className="text-sm text-zinc-500">{t.noData}</p>
              ) : (
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={dashboard.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" strokeWidth={2} />
                      <Line type="monotone" dataKey="profit" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="card p-4">
                <h2 className="mb-3 text-lg font-bold text-zinc-950">{t.topProducts}</h2>
                {dashboard.topProducts.length === 0 ? (
                  <p className="text-sm text-zinc-500">{t.noData}</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.topProducts.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
                          <p className="text-xs text-zinc-500">{t.ordersCount}: {item.count}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-zinc-950">${item.revenue.toFixed(0)}</p>
                          <p className="text-xs text-zinc-500">{t.profit}: ${item.profit.toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
                <div className="card p-4">
                  <h2 className="mb-3 text-lg font-bold text-zinc-950">{t.topSizes}</h2>
                  {dashboard.topSizes.length === 0 ? (
                    <p className="text-sm text-zinc-500">{t.noData}</p>
                  ) : (
                    <div className="space-y-3">
                      {dashboard.topSizes.map((item) => (
                        <div key={item.size} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3">
                          <p className="text-sm font-semibold text-zinc-900">{item.size}</p>
                          <p className="text-sm font-bold text-zinc-950">{item.count}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card p-4">
                  <h2 className="mb-3 text-lg font-bold text-zinc-950">{t.topCities}</h2>
                  {dashboard.topCities.length === 0 ? (
                    <p className="text-sm text-zinc-500">{t.noData}</p>
                  ) : (
                    <div className="space-y-3">
                      {dashboard.topCities.map((item) => (
                        <div key={item.city} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">{item.city}</p>
                            <p className="text-xs text-zinc-500">{t.ordersCount}: {item.count}</p>
                          </div>
                          <p className="text-sm font-bold text-zinc-950">${item.revenue.toFixed(0)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-4">
                <h2 className="mb-3 text-lg font-bold text-zinc-950">{t.lastOrders}</h2>
                {dashboard.latestOrders.length === 0 ? (
                  <p className="text-sm text-zinc-500">{t.noData}</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.latestOrders.map((item) => (
                      <div key={item.id} className="rounded-2xl bg-zinc-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">{item.product_name}</p>
                            <p className="mt-1 text-xs text-zinc-500">{item.full_name} · {item.phone}</p>
                            <p className="mt-1 text-xs text-zinc-500">{t.sizeLabel}: {item.size} · ${item.price}</p>
                            <p className="mt-1 text-xs text-zinc-500">{t.profit}: ${Number(item.profit || 0).toFixed(0)}</p>
                          </div>
                          <p className="text-xs text-zinc-500">{formatDate(item.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : tab === "products" ? (
        <>
          <form onSubmit={saveProduct} className="card space-y-3 p-4">
            <h2 className="text-lg font-bold text-zinc-950">{editingId ? t.edit : t.addProduct}</h2>
            <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <input className="input" placeholder="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
            <input className="input" placeholder={t.brandLabel} value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
            <select className="input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
              <option value="sneakers">Sneakers</option>
              <option value="cloth">Cloth</option>
            </select>
            <input className="input" placeholder="Price" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            <input className="input" placeholder={t.costPrice} value={form.cost_price} onChange={(e) => setForm((p) => ({ ...p, cost_price: e.target.value }))} />

            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
              <label className="mb-2 block text-sm font-medium text-zinc-700">{t.chooseImage}</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm" />
              <p className="mt-2 text-xs text-zinc-500">{uploadingImage ? t.uploading : t.uploadImage}</p>
            </div>

            <input className="input" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} />
            {form.image_url ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-3">
                <p className="mb-2 text-sm font-medium text-zinc-700">{t.imagePreview}</p>
                <img src={form.image_url} alt="preview" className="h-40 w-full rounded-2xl object-cover" />
              </div>
            ) : null}

            <textarea className="input" rows="4" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            <input className="input" placeholder={t.stockHint} value={form.stock_by_size} onChange={(e) => setForm((p) => ({ ...p, stock_by_size: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} />
              Active
            </label>
            <button className="btn-primary w-full" disabled={uploadingImage}>{editingId ? t.save : t.create}</button>
            {message ? <p className="text-sm text-zinc-700">{message}</p> : null}
          </form>

          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="card p-5 text-sm text-zinc-600">{t.noProducts}</div>
            ) : products.map((item) => (
              <div key={item.id} className="card p-4">
                <div className="flex gap-3">
                  <img src={item.image_url} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">{item.name}</h3>
                        <p className="text-xs text-zinc-500">{item.brand} · {item.category}</p>
                        <p className="mt-1 text-xs text-zinc-500">{t.stockBySize}: {stockToString(item.stock_by_size || []) || "-"}</p>
                        <p className="mt-1 text-xs text-zinc-500">{t.costPrice}: ${Number(item.cost_price || 0).toFixed(0)}</p>
                      </div>
                      <p className="text-sm font-bold text-zinc-950">${item.price}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => editProduct(item)} className="btn-secondary px-4 py-2">{t.edit}</button>
                      <button onClick={() => deleteProduct(item.id)} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">{t.delete}</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="card p-5 text-sm text-zinc-600">{t.noOrders}</div>
          ) : orders.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{item.product_name}</h3>
                  <p className="mt-1 text-xs text-zinc-500">{item.full_name} · {item.phone}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.city} · {item.address}</p>
                  <p className="mt-1 text-xs text-zinc-500">{t.sizeLabel}: {item.size} · ${item.price}</p>
                  <p className="mt-1 text-xs text-zinc-500">{t.profit}: ${Number(item.profit || 0).toFixed(0)}</p>
                  <p className="mt-1 text-xs text-zinc-500">{t.createdAt}: {formatDate(item.created_at)}</p>
                </div>
                <select className="input max-w-[130px]" value={item.status} onChange={(e) => updateOrderStatus(item.id, e.target.value)}>
                  <option value="pending">{t.pending}</option>
                  <option value="paid">{t.paid}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
