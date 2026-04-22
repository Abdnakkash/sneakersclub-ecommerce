import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabaseEnv = Boolean(url && key);
export const storageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "product-images";

export const supabase = hasSupabaseEnv
  ? createClient(url, key)
  : null;
