import { promises as fs } from "node:fs";
import path from "node:path";

export type TemplateFeatures = {
  supports_copies: boolean;
  supports_qr: boolean;
  supports_background: boolean;
};

export type TemplateManifest = {
  id: string;
  display_name: string;
  description: string;
  version: string;
  required_paths: string[];
  optional_paths: string[];
  features: TemplateFeatures;
};

export type Template = { id: string; html: string; css: string; manifest: TemplateManifest };

export type TemplateSummary = Pick<
  TemplateManifest,
  "id" | "display_name" | "description" | "version" | "features"
>;

const TEMPLATES_DIR = path.join(process.cwd(), "templates");

export async function getTemplate(templateId: string): Promise<Template> {
  const dir = path.join(TEMPLATES_DIR, templateId);
  const htmlPath = path.join(dir, "template.html");
  const cssPath = path.join(dir, "style.css");
  const manifestPath = path.join(dir, "manifest.json");

  try {
    const [html, css, manifestRaw] = await Promise.all([
      fs.readFile(htmlPath, "utf-8"),
      fs.readFile(cssPath, "utf-8"),
      fs.readFile(manifestPath, "utf-8"),
    ]);
    const manifest = JSON.parse(manifestRaw) as TemplateManifest;
    return { id: templateId, html, css, manifest };
  } catch (e: any) {
    const msg = e?.code === "ENOENT"
      ? `Template '${templateId}' not found. Expected files: ${htmlPath}, ${cssPath} and ${manifestPath}`
      : `Failed to load template '${templateId}': ${String(e?.message ?? e)}`;
    throw new Error(msg);
  }
}

export async function listTemplates(): Promise<TemplateSummary[]> {
  const entries = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();

  const manifests = await Promise.all(
    dirs.map(async (dir) => {
      const manifestPath = path.join(TEMPLATES_DIR, dir, "manifest.json");
      const manifestRaw = await fs.readFile(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestRaw) as TemplateManifest;
      return {
        id: manifest.id,
        display_name: manifest.display_name,
        description: manifest.description,
        version: manifest.version,
        features: manifest.features,
      } satisfies TemplateSummary;
    })
  );

  return manifests;
}
