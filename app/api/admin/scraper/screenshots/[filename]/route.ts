import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  const { filename } = await params;

  // Prevent path traversal — only allow safe screenshot filenames
  if (!/^scraper-\d+-[^/\\]+\.png$/.test(filename)) {
    return Response.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filepath = path.join("/tmp", filename);
  try {
    const buffer = await fs.readFile(filepath);
    return new Response(buffer, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "File not found" }, { status: 404 });
  }
}
