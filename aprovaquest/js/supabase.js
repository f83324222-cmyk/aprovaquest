/* Cliente Supabase via CDN. A chave usada aqui deve ser a chave pública (anon/publishable). */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import "./config.js";

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APROVAQUEST_CONFIG;

export const supabaseConfigured =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("SEU-PROJETO") &&
  !SUPABASE_ANON_KEY.includes("SUA_CHAVE");

export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder"
);
