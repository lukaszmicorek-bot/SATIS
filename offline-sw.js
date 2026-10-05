/* Static shell only. Never cache API responses, uploaded files or user data. */
const VERSION = "20261005-4";
const CACHE = `satis-shell-${VERSION}`;
const SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js";
const SDK_INTEGRITY = "sha384-iLddHTLokph6Omwoyid4XKxHaWa6w41BnoEj0q5oOrzmYPpHIKt1wyjReA7s//pP";
const ASSETS = ["index.html", "app.js", "data-layer.js", "sync-layer.js", "offline-vault.js", "offline-forms.js",
  "styles.css", "supabase-config.js", "InterVariable.woff2", "InterVariable-Italic.woff2", "satis-monogram.png",
  "favicon-32.png", "favicon.png", "favicon.svg", "apple-touch-icon.png",
  "manufacturer-logos/audio-service.png", "manufacturer-logos/audibel.png", "manufacturer-logos/beltone.png",
  "manufacturer-logos/bernafon.png", "manufacturer-logos/bernafon-offer.svg", "manufacturer-logos/oticon.png",
  "manufacturer-logos/philips.svg", "manufacturer-logos/phonak.png", "manufacturer-logos/resound.png",
  "manufacturer-logos/resound-offer.png", "manufacturer-logos/signia.png", "manufacturer-logos/sonic.png",
  "manufacturer-logos/sonic-offer.png", "manufacturer-logos/starkey.png", "manufacturer-logos/starkey-offer.svg"];
const urls = new Set(ASSETS.map(name => new URL(name, self.registration.scope).href));
self.addEventListener("install", event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  try {
    for (const url of [...urls, SDK]) {
      const response = await fetch(new Request(url, { cache: "reload", ...(url === SDK ? { integrity: SDK_INTEGRITY, mode: "cors" } : {}) }));
      if (!response.ok || response.redirected) throw new Error("Incomplete offline shell");
      if (url.endsWith("/index.html") && !(await response.clone().text()).includes(`app.js?v=${VERSION}`)) throw new Error("Offline shell version mismatch");
      await cache.put(url, response);
    }
  } catch (error) { await caches.delete(CACHE); throw error; }
})()));
// No skipWaiting: never replace code under an open, unsaved form.
self.addEventListener("activate", event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if (name.startsWith("satis-shell-") && name !== CACHE) await caches.delete(name);
})()));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const clean = `${url.origin}${url.pathname}`;
  const index = new URL("index.html", self.registration.scope).href;
  let key = urls.has(clean) || clean === SDK ? clean : null;
  if (event.request.mode === "navigate" && (clean === self.registration.scope || clean === index)) {
    key = index;
  }
  if (!key) return;
  if (key !== index && url.searchParams.has("v") && url.searchParams.get("v") !== VERSION) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async cache => {
    if (key === index) {
      try {
        const response = await fetch(event.request);
        if (response.ok) return response;
      } catch {}
    }
    return (await cache.match(key)) || fetch(event.request);
  }));
});
