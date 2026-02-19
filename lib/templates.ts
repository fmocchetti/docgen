import { promises as fs } from "node:fs";
import path from "node:path";

export type Template = { id: string; html: string; css: string };

const TEMPLATES_DIR = path.join(process.cwd(), "templates");

export async function getTemplate(templateId: string): Promise<Template> {
  const dir = path.join(TEMPLATES_DIR, templateId);
  const htmlPath = path.join(dir, "template.html");
  const cssPath = path.join(dir, "style.css");

  try {
    const [html, css] = await Promise.all([fs.readFile(htmlPath, "utf-8"), fs.readFile(cssPath, "utf-8")]);
    return { id: templateId, html, css };
  } catch (e: any) {
    const msg = e?.code === "ENOENT"
      ? `Template '${templateId}' not found. Expected files: ${htmlPath} and ${cssPath}`
      : `Failed to load template '${templateId}': ${String(e?.message ?? e)}`;
    throw new Error(msg);
  }
}

export async function listTemplates(): Promise<string[]> {
  const entries = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => e.name).sort();
}
