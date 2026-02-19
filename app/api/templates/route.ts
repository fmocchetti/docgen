import { NextResponse } from "next/server";
import { listTemplates } from "@/lib/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await listTemplates();
  return NextResponse.json(templates, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
