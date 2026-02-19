/** @type {import('next').NextConfig} */
const nextConfig = {
  // Needed for puppeteer on serverless:
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  serverExternalPackages: [
    "handlebars",
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium",
    "qrcode",
  ],
};
export default nextConfig;
