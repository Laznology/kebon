import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalName = request.headers.get("x-filename") || `image-${Date.now()}.png`;
    const hash = crypto
      .createHash("md5")
      .update(buffer + Date.now().toString())
      .digest("hex");
    const outFile = `${hash}.webp`;
    const outDir = path.join(process.cwd(), "public", "images");
    await mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, outFile);
    const metadata = await sharp(buffer).metadata();
    const { height, width } = metadata;
    const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    await writeFile(outPath, webpBuffer);
    return NextResponse.json({
      url: `/images/${outFile}`,
      height: height,
      width: width,
      alt: originalName,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
