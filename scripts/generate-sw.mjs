import { generateSW } from "workbox-build";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const candidates = [
  resolve(root, ".vercel/output/static"),
  resolve(root, ".output/public"),
];

const distDir = candidates.find((d) => existsSync(d));
if (!distDir) {
  console.error("No output directory found. Looked in:", candidates);
  process.exit(1);
}

console.log(`Using output directory: ${distDir}`);

const { count, size, warnings } = await generateSW({
  swDest: resolve(distDir, "sw.js"),
  globDirectory: distDir,
  globPatterns: ["**/*.{js,css,html,png,svg,woff2,woff,ttf}"],
  globIgnores: ["**/sw.js", "sw.js", "workbox-*.js"],
  dontCacheBustURLsMatching: /\.\w{8}\.\w+\.(js|css|png|svg|woff2|woff|ttf)$/,
  navigateFallback: "/",
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\.(?:woff2|woff|ttf|otf)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "fonts",
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
  ],
});

if (warnings.length > 0) {
  console.warn("SW generation warnings:", warnings);
}

console.log(`Generated sw.js: ${count} precached entries, ${(size / 1024).toFixed(1)} KB`);
