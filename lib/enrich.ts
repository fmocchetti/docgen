import QRCode from "qrcode";

/**
 * Enrich payload with derived fields that are convenient for templates.
 * - Generates QR code (data URL) if document.qr_text exists and images.qr is not provided.
 * - Provides sane defaults for copies.
 */
export async function enrichPayload(payload: any) {
  const p = structuredClone(payload ?? {});
  p.images = p.images ?? {};
  p.document = p.document ?? {};

  // Default copies
  if (!Array.isArray(p.copies) || p.copies.length === 0) {
    p.copies = [{ label: "ORIGINAL" }];
  }

  // Generate QR if requested
  const qrText = p.document.qr_text || p.document.number;
  if (!p.images.qr && qrText) {
    try {
      p.images.qr = await QRCode.toDataURL(String(qrText), { margin: 1, width: 256 });
    } catch {
      // ignore
    }
  }

  return p;
}
