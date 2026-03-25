import type { NextRequest } from "next/server";
import { verifyBffToken } from "@/lib/verify-bff-token";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const auth = await verifyBffToken(request);
  if (!auth.ok) return auth.response;

  let files: { name: string; sizeKb: number; createdAt: string }[] = [];
  try {
    const entries = fs.readdirSync("/tmp");
    files = entries
      .filter((f) => /^scraper-\d+-[^/]+\.png$/.test(f))
      .map((f) => {
        const stat = fs.statSync(path.join("/tmp", f));
        return {
          name: f,
          sizeKb: Math.round(stat.size / 1024),
          createdAt: stat.birthtime.toISOString(),
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    // /tmp may be empty or inaccessible
  }

  return Response.json({ files });
}
