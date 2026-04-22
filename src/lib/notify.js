import { supabase } from "./supabase";

export async function sendOrderNotifications(payload) {
  const functionName = import.meta.env.VITE_ORDER_NOTIFICATION_FUNCTION || "order-notify";
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });
  return { data, error };
}
