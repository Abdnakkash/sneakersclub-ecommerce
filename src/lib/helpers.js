export const currency = (value) => `$${Number(value || 0).toFixed(0)}`;

export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

export const slugify = (value = "") =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const uniqueFileName = (file) => {
  const ext = file?.name?.split(".").pop() || "jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
};

export const normalizeStock = (stock) => {
  if (!Array.isArray(stock)) return [];
  return stock
    .map((item) => ({
      size: String(item?.size ?? "").trim(),
      quantity: Number(item?.quantity ?? 0),
    }))
    .filter((item) => item.size && item.quantity > 0);
};

export const stockToString = (stock) =>
  normalizeStock(stock)
    .map((item) => `${item.size}:${item.quantity}`)
    .join(", ");

export const stringToStock = (value = "") =>
  value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [size, quantity] = part.split(":").map((x) => x?.trim());
      return {
        size: size || "",
        quantity: Number(quantity || 0),
      };
    })
    .filter((item) => item.size && item.quantity > 0);

export const availableSizesFromStock = (stock) =>
  normalizeStock(stock).map((item) => item.size);

export const getQuantityForSize = (stock, size) => {
  const found = normalizeStock(stock).find((item) => String(item.size) === String(size));
  return found ? found.quantity : 0;
};

export const decreaseStock = (stock, soldSize) => {
  const next = normalizeStock(stock)
    .map((item) =>
      String(item.size) === String(soldSize)
        ? { ...item, quantity: item.quantity - 1 }
        : item
    )
    .filter((item) => item.quantity > 0);
  return next;
};

export const whatsappUrl = (text) => {
  const phone = import.meta.env.VITE_ADMIN_WHATSAPP || "";
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

export const buildAdminOrderWhatsappText = ({ product, size, customer }) =>
  [
    "New Order - SneakersClub",
    "",
    `Product: ${product.name}`,
    `Brand: ${product.brand || "-"}`,
    `Category: ${product.category}`,
    `Size: ${size}`,
    `Price: $${product.price}`,
    "",
    `Customer: ${customer.full_name}`,
    `Phone: ${customer.phone}`,
    `City: ${customer.city}`,
    `Address: ${customer.address}`,
    `Note: ${customer.note || "-"}`,
  ].join("\n");
