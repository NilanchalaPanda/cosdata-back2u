import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("lost_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return NextResponse.json({ ok: false, error: "DB fetch failed" });
    }

    return NextResponse.json({
      ok: true,
      items: data || [],
    });
  } catch (err) {
    const e = err as Error;
    console.error("Unexpected GET error:", e.message);
    return NextResponse.json({ ok: false, error: e.message });
  }
}
