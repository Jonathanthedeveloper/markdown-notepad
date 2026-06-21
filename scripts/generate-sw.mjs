import { generateSW } from "workbox-build";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../.output/public");

const { count, size, warnings } = await generateSW({
  swDest: resolve(distDir, "sw.js"),
  globDirectory: distDir,
  globPatterns: ["**/*.{js,css,html,png,svg,woff2,woff,ttf}"],
  globIgnores: ["**/sw.js"],
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
