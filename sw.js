const CACHE = 'note-taker-v2';
const BASE  = '/android-note-taker';
const SHELL = [BASE + '/', BASE + '/index.html', BASE + '/style.css', BASE + '/app.js',
               'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js'];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()))
);

self.addEventListener('activate', e =>
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
);

self.addEventListener('fetch', e => {
  // API calls go straight to network
  if (e.request.url.includes('api.anthropic.com') || e.request.url.includes('api.openai.com')) {
    return;
  }
  // Network-first for app shell — always get fresh content, fall back to cache if offline
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
