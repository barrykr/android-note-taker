const CACHE = 'note-taker-v1';
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
  // Network-first for API calls, cache-first for app shell
  if (e.request.url.includes('api.anthropic.com') || e.request.url.includes('api.openai.com')) {
    return; // let these go straight to network
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
