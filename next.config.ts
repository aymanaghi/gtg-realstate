import type { NextConfig } from "next";

/**
 * SHOWCASE=1 builds a static demo for GitHub Pages (see scripts/showcase).
 * The normal build is the full app: proxy, server actions, Supabase.
 */
const showcase = process.env.SHOWCASE === "1";
const basePath = showcase ? (process.env.PAGES_BASE_PATH ?? "") : "";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Static export can't use Cache Components; the showcase doesn't need it.
  cacheComponents: !showcase,
  partialPrefetching: !showcase,
  ...(showcase && { output: "export", trailingSlash: true }),
  basePath: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    unoptimized: showcase,
    remotePatterns: [
      // Placeholder listing photos until GTG supplies its own.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Listing photos uploaded to Supabase Storage.
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
