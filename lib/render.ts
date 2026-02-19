import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import Handlebars from "handlebars";

type Args = {
  templateHtml: string;
  templateCss: string;
  data: any;
};

function registerHelpers() {
  // Register once
  if ((Handlebars as any).__docgen_helpers_registered) return;
  (Handlebars as any).__docgen_helpers_registered = true;

  Handlebars.registerHelper("default", function (value: any, fallback: any) {
    return value ?? fallback;
  });

  Handlebars.registerHelper("uppercase", function (value: any) {
    return String(value ?? "").toUpperCase();
  });

  Handlebars.registerHelper("addOne", function (value: any) {
    const n = Number(value);
    return Number.isFinite(n) ? n + 1 : value;
  });

  Handlebars.registerHelper("formatDate", function (value: any) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    // yyyy-mm-dd
    return d.toISOString().slice(0, 10);
  });
}

export async function renderPdfFromTemplate({ templateHtml, templateCss, data }: Args) {
  registerHelpers();

  const compile = Handlebars.compile(templateHtml, { noEscape: true, strict: false });
  const htmlBody = compile(data);

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION);

  const browser = isServerless
    ? await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      })
    : await (await import("puppeteer")).default.launch({
        headless: true,
      });

  try {
    const page = await browser.newPage();

    await page.setContent(
      `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${templateCss}</style>
  </head>
  <body>${htmlBody}</body>
</html>`,
      { waitUntil: "networkidle0" }
    );

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
