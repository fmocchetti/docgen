/** @type {import('next').NextConfig} */
const nextConfig = {
  // Needed for puppeteer on serverless:
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};
export default nextConfig;
