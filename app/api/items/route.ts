// app/api/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/db";
import { compressBase64Image } from "@/lib/image";
import { getEmbedding } from "@/lib/embeddings";
import {
  ensureCollectionExists,
  insertVector,
  vectorExists,
} from "@/lib/cosdata";

const COLLECTION_NAME = process.env.COSDATA_COLLECTION_NAME!;
const VECTOR_DIM = Number(process.env.COSDATA_DIM || 1536);

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      textDescription,
      campusTag,
      locationName,
      lat,
      lng,
      imageBase64,
      contactName,
      contactPhone,
      contactNote,
    } = body;

    console.log("Received POST /api/items with body:", body);

    if (!title || !textDescription || !campusTag || !locationName) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const created_at = new Date().toISOString();

    // Compress Image
    let compressedBase64: string | null = null;
    if (imageBase64) {
      compressedBase64 = await compressBase64Image(imageBase64);
    }

    // Insert into Supabase
    // const { error } = await supabaseAdmin.from("lost_items").insert({
    //   id,
    //   title,
    //   text_description: textDescription,
    //   campus_tag: campusTag,
    //   location_name: locationName,
    //   lat,
    //   lng,
    //   image_base64: compressedBase64,
    //   contact_name: contactName || null,
    //   contact_phone: contactPhone || null,
    //   contact_note: contactNote || null,
    //   status: "found",
    //   created_at,
    // });

    // if (error) {
    //   console.error("Supabase Error:", error);
    //   return NextResponse.json(
    //     { ok: false, error: "Failed DB Insert" },
    //     { status: 500 }
    //   );
    // }

    // Generate Embedding Text
    const embedInput = `${title}. ${textDescription}. Location: ${locationName}, ${campusTag}.`;

    console.log("embedding - ", embedInput);

    const embedVector = await getEmbedding(embedInput);
    if (embedVector.length !== VECTOR_DIM) {
      throw new Error("Embedding dimension mismatch");
    }

    // Insert into Cosdata
    await ensureCollectionExists(COLLECTION_NAME, VECTOR_DIM);
    await insertVector(COLLECTION_NAME, id, embedVector);

    // Verify Insertion
    const existsCheck = await vectorExists(COLLECTION_NAME, id);
    if (!existsCheck) {
      console.warn("Vector did not successfully insert:", id);
    }

    return NextResponse.json({ ok: true, id });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("POST /api/items ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
