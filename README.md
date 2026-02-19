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
