// lib/image.ts
import sharp from "sharp";

export async function compressBase64Image(
  dataUrl: string,
  maxWidth = 512,
  quality = 80
): Promise<string> {
  try {
    const [header, base64] = dataUrl.split(",");
    if (!base64) return dataUrl;

    const inputBuffer = Buffer.from(base64, "base64");

    const outputBuffer = await sharp(inputBuffer)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    const compressedBase64 = outputBuffer.toString("base64");
    return `data:image/jpeg;base64,${compressedBase64}`;
  } catch (err) {
    console.error("[Image] compression failed, using original:", err);
    return dataUrl;
  }
}
