import { NextResponse } from "next/server";
import { renderPdfFromTemplate } from "@/lib/render";
import { getTemplate } from "@/lib/templates";
import { enrichPayload } from "@/lib/enrich";
import { getPath, validatePayload } from "@/lib/validate";

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

  let template;
  try {
    // MVP: templates are hardcoded in the repo. instance_id is accepted for future routing / isolation.
    template = await getTemplate(String(template_id));
  } catch (e: any) {
    return jsonError(404, "Template not found", String(e?.message ?? e));
  }

  const payloadWithFallback = structuredClone(payload ?? {});
  payloadWithFallback.images = payloadWithFallback.images ?? {};

  if (!payloadWithFallback.images.logo && payloadWithFallback.instance?.logo) {
    payloadWithFallback.images.logo = payloadWithFallback.instance.logo;
  }

  const validation = validatePayload(payloadWithFallback, template.manifest);

  // Explicit folio policy: no service-side generation, required if template demands it.
  if (template.manifest.required_paths.includes("document.number")) {
    const folio = getPath(payloadWithFallback, "document.number");
    const hasFolio = !(folio === undefined || folio === null || (typeof folio === "string" && folio.trim().length === 0));
    if (!hasFolio && !validation.errors.includes("Missing required field: document.number")) {
      validation.errors.push("Missing required field: document.number");
      validation.ok = false;
    }
  }

  if (!validation.ok) {
    return jsonError(400, "Payload validation failed", validation.errors);
  }

  const enriched = await enrichPayload(payloadWithFallback);

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
