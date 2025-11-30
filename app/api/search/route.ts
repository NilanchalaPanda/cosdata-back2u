/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { getEmbedding } from "@/lib/embeddings";
import { ensureCollectionExists, searchVectors } from "@/lib/cosdata";

const COLLECTION_NAME = process.env.COSDATA_COLLECTION_NAME!;
const VECTOR_DIM = Number(process.env.COSDATA_DIM || 1536);

export const runtime = "nodejs";

export interface LostItemRow {
  id: string;
  title: string;
  text_description: string;
  campus_tag: string;
  location_name: string;
  image_base64: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_note: string | null;
  created_at: string;
}

export async function POST(req: NextRequest) {
  try {
    const { campusTag, queryText } = await req.json();

    if (!campusTag || !queryText) {
      return NextResponse.json(
        { ok: false, error: "Missing campusTag or queryText" },
        { status: 400 }
      );
    }

    await ensureCollectionExists(COLLECTION_NAME, VECTOR_DIM);

    // Embed query
    const embedQuery = `${queryText}. Lost in ${campusTag}`;
    const vector = await getEmbedding(embedQuery);

    // Vector search from Cosdata
    const searchResults = await searchVectors(COLLECTION_NAME, vector, 20);
    const ids = searchResults.map((r) => r.id);

    if (ids.length === 0) {
      return NextResponse.json({ ok: true, results: [] });
    }

    // Fetch rows from Supabase
    const { data: rows, error } = await supabaseAdmin
      .from("lost_items")
      .select("*")
      .in("id", ids)
      .returns<LostItemRow[]>();

    if (!rows || error) return NextResponse.json({ ok: true, results: [] });

    const rowMap = new Map(rows.map((item) => [item.id, item]));

    // Merge + filter by location
    // Merge & filter + strong typing
    const finalResults = searchResults
      .map((vectorResult: { id: string; score: number }) => {
        const matchingRow = rowMap.get(vectorResult.id);
        if (!matchingRow) return null;
        if (matchingRow.campus_tag !== campusTag) return null;

        return {
          id: matchingRow.id,
          score: vectorResult.score,
          title: matchingRow.title,
          textDescription: matchingRow.text_description,
          campusTag: matchingRow.campus_tag,
          locationName: matchingRow.location_name,
          imageBase64: matchingRow.image_base64,
          contactName: matchingRow.contact_name,
          contactPhone: matchingRow.contact_phone,
          contactNote: matchingRow.contact_note,
          createdAt: matchingRow.created_at,
        };
      })
      .filter(
        (merged): merged is NonNullable<typeof merged> => merged !== null
      );

    return NextResponse.json({ ok: true, results: finalResults });
  } catch (e: any) {
    console.error("[Search API Error]", e);
    return NextResponse.json({ ok: false, error: e.message });
  }
}
