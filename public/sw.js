// ── BeatStream Service Worker ─────────────────────────────────────────────────
// Bump CACHE_VERSION whenever you deploy a new build so stale assets are
// evicted automatically on the next visit.
const CACHE_VERSION    = "v1";
const SHELL_CACHE      = `beatstream-shell-${CACHE_VERSION}`;
const AUDIO_CACHE      = `beatstream-audio-${CACHE_VERSION}`;
const ALL_CACHES       = [SHELL_CACHE, AUDIO_CACHE];

// ── Caching strategies ────────────────────────────────────────────────────────
// App shell  → Cache First + background revalidate (instant loads)
// Audio      → Cache First (Cloudinary URLs are immutable — same URL = same file)
// Firebase   → Network Only (real-time, never stale)
// Everything else → Network First with cache fallback
// ─────────────────────────────────────────────────────────────────────────────

// App shell assets pre-cached on install
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Never cache — real-time Firebase / Auth APIs
const NETWORK_ONLY_ORIGINS = new Set([
  "firestore.googleapis.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "firebase.googleapis.com",
  "firebaseinstallations.googleapis.com",
]);

// Audio / image CDN — Cloudinary
const CDN_ORIGIN = "res.cloudinary.com";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** True for responses worth caching (2xx, not opaque) */
const isCacheable = (res) =>
  res && res.status >= 200 && res.status < 300 && res.type !== "opaque";

/** Open a cache and put a cloned response — fire-and-forget, never throws */
const putInCache = (cacheName, request, response) => {
  if (!isCacheable(response)) return;
  caches.open(cacheName).then((c) => c.put(request, response.clone())).catch(() => {});
};

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),   // activate immediately, no waiting
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !ALL_CACHES.includes(k))  // delete every unknown cache
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),              // take control immediately
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept GET — never touch mutations
  if (request.method !== "GET") return;

  // Only intercept http(s) — skip chrome-extension://, data:, etc.
  if (!request.url.startsWith("http")) return;

  const url = new URL(request.url);

  // ── 1. Network Only — Firebase / Auth ────────────────────────────────────
  if (NETWORK_ONLY_ORIGINS.has(url.hostname)) {
    // Don't call event.respondWith — let the browser handle it natively.
    // This is faster than event.respondWith(fetch(request)) because it
    // skips the SW's fetch handler overhead entirely.
    return;
  }

  // ── 2. Cache First — Cloudinary CDN (audio + cover images) ───────────────
  // Cloudinary URLs are content-addressed: the same URL always returns the
  // same bytes. Cache First is correct here — no need to hit the network
  // if we already have it. Significantly reduces audio load time on repeat plays.
  if (url.hostname.includes(CDN_ORIGIN)) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;                    // cache hit — instant

        // Cache miss — fetch, cache, return
        try {
          const response = await fetch(request);
          putInCache(AUDIO_CACHE, request, response);
          return response;
        } catch {
          // Offline and not cached — return an empty audio response
          // so the player doesn't throw a network error
          return new Response("", {
            status: 503,
            statusText: "Offline — audio not cached",
          });
        }
      }),
    );
    return;
  }

  // ── 3. Cache First + background revalidate — App shell ───────────────────
  // Serve instantly from cache. Fetch the latest in background and update
  // the cache so the NEXT visit gets the freshest version.
  // This is the standard "stale-while-revalidate" pattern.
  event.respondWith(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const cached = await cache.match(request);

      // Always revalidate in background regardless of cache hit
      const revalidate = fetch(request)
        .then((response) => {
          putInCache(SHELL_CACHE, request, response);
          return response;
        })
        .catch(() => null);                           // offline — ignore quietly

      // Return cached immediately if available, otherwise wait for network
      return cached ?? (await revalidate) ?? Response.error();
    }),
  );
});

// ── Message: force update ─────────────────────────────────────────────────────
// Lets the app trigger a cache refresh programmatically:
//   navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" })
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});