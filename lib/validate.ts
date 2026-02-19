import type { TemplateManifest } from "@/lib/templates";

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

export function getPath(obj: unknown, path: string): unknown {
  if (!path) return undefined;
  const keys = path.split(".").filter(Boolean);

  let current: any = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }

  return current;
}

function hasRequiredValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

export function validatePayload(payload: unknown, manifest: TemplateManifest): ValidationResult {
  const errors: string[] = [];

  for (const requiredPath of manifest.required_paths) {
    if (requiredPath === "assets") {
      const assets = getPath(payload, "assets");
      if (!Array.isArray(assets) || assets.length < 1) {
        errors.push("Missing required field: assets must be a non-empty array");
      }
      continue;
    }

    const value = getPath(payload, requiredPath);
    if (!hasRequiredValue(value)) {
      errors.push(`Missing required field: ${requiredPath}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
