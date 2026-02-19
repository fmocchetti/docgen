import { NextResponse } from "next/server";
import { renderPdfFromTemplate } from "@/lib/render";
import { getTemplate } from "@/lib/templates";
import { enrichPayload } from "@/lib/enrich";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json({ error, details }, { status });
}

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const expected = process.env.DOCGEN_API_KEY;
  if (!expected) return jsonError(500, "Server misconfigured: missing DOCGEN_API_KEY");
  if (!apiKey || apiKey !== expected) return jsonError(401, "Invalid API key");

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const { instance_id, template_id, payload } = body ?? {};
  if (!instance_id || !template_id || !payload) {
    return jsonError(400, "Missing instance_id, template_id or payload");
  }

  // MVP: templates are hardcoded in the repo. instance_id is accepted for future routing / isolation.
  const template = await getTemplate(String(template_id));
  const enriched = await enrichPayload(payload);

  const pdfBuffer = await renderPdfFromTemplate({
    templateHtml: template.html,
    templateCss: template.css,
    data: enriched,
  });

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${template_id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
