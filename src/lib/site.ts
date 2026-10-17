export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return configured || (vercel ? `https://${vercel}` : "http://localhost:3000");
}
