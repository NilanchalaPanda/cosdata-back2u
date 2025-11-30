import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("Supabase URL - ", SUPABASE_URL);
console.log("Supabase Service Role Key - ", SUPABASE_SERVICE_ROLE_KEY);

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

console.log("Supabase Admin Client Initialized - ", supabaseAdmin);
