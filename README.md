# docgen-mvp (Vercel-friendly)

MVP de generación de PDFs desde templates HTML + CSS (Handlebars) usando Chromium serverless.

## Templates incluidos
- `grupo_gigante_asignacion_v1` (basado en carta de asignación de equipo / responsiva)
- `qualitas_responsiva_sistemas_ti_v1` (basado en carta responsiva)

## Requisitos
- Node 18+ (ideal 20)

## Config
Setear variable de entorno:
- `DOCGEN_API_KEY` (string)

## Run local
```bash
npm install
DOCGEN_API_KEY=devkey npm run dev
```

## Browser runtime behavior
- Local development: uses `puppeteer` and your local downloaded Chrome binary.
- Serverless (Vercel/AWS Lambda): uses `puppeteer-core` + `@sparticuz/chromium`.

This avoids `spawn ...\\Temp\\chromium ENOENT` on Windows local runs while keeping serverless compatibility.

## Render (curl)
```bash
curl -X POST "http://localhost:3000/api/render" \
  -H "Content-Type: application/json" \
  -H "x-api-key: devkey" \
  -d @./sample-payloads/grupo_gigante.json \
  --output out.pdf
```

## Deploy a Vercel
1. Subí el repo a GitHub
2. Import en Vercel
3. Environment Variables: `DOCGEN_API_KEY`
4. Deploy

## Nota sobre assets (logo/background)
En este MVP los templates esperan que `images.logo` / `images.background` / `images.*_signature` sean URLs o Data URLs (`data:image/...`).

## Manifest authoring checklist
Para agregar un template nuevo bajo `templates/<template_id>/`:

1. Crear archivos:
- `template.html`
- `style.css`
- `manifest.json`

2. Definir `manifest.json` con:
- `id`, `display_name`, `description`, `version`
- `required_paths` (campos obligatorios del payload)
- `optional_paths` (campos opcionales)
- `features` (`supports_copies`, `supports_qr`, `supports_background`)

3. Reglas recomendadas:
- Si el template muestra folio, incluir `document.number` en `required_paths`.
- Si usa logo, usar `{{images.logo}}` y envolver en `{{#if images.logo}}...{{/if}}`.
- Incluir `assets` en `required_paths` cuando la tabla/lista de activos sea obligatoria.

4. Validaci¢n en runtime:
- `POST /api/render` carga el manifiesto y valida `payload` antes de renderizar.
- Si falta un campo requerido, responde `400` con `details`.
- Caso especial: `assets` debe ser arreglo no vac¡o.

5. Endpoints de soporte:
- `GET /api/templates`: lista metadatos desde los `manifest.json`.
- `POST /api/render`: renderiza PDF si el payload cumple el manifiesto.

6. Prueba r pida en PowerShell:
```powershell
curl.exe -sS http://localhost:3000/api/templates

curl.exe -sS -o out.pdf -w "HTTP %{http_code}`n" `
  -X POST http://localhost:3000/api/render `
  -H "Content-Type: application/json" `
  -H "x-api-key: devkey" `
  --data-binary "@sample-payloads/grupo_gigante.json"
```
