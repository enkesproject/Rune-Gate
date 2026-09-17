const CACHE_NAME = 'rune-gate-v5';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

const AUDIO_URLS = [
  'https://res.cloudinary.com/sogbouii/video/upload/v1789578621/dragon-studio-gunshot-511311.mp3',
  'https://res.cloudinary.com/sogbouii/video/upload/v1789578621/glass-breaking-sound-effect_wLZSIYn.mp3',
  'https://res.cloudinary.com/sogbouii/video/upload/v1789150310/Effect_Naik_Level.wav',
  'https://res.cloudinary.com/sogbouii/video/upload/v1789579343/wings_of_freedom-bomb-explosion-469038.mp3',
  'https://res.cloudinary.com/sogbouii/video/upload/v1788837869/Energy_Impulse_02.wav',
  'https://res.cloudinary.com/sogbouii/video/upload/v1788965435/congratulations-Level_success.mp3',
  'https://res.cloudinary.com/sogbouii/video/upload/v1789150308/Effect_Kemenangan_Setiap_Level.mp3',
  'https://res.cloudinary.com/sogbouii/video/upload/v1788965436/no-way-Pecah_1_baris.mp3',
  'https://res.cloudinary.com/sogbouii/video/upload/v1788837529/Block_Drop_Bounce.mp3',
  'https://res.cloudinary.com/sogbouii/video/upload/v1789582560/Medan_Perang.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function isAudio(url) {
  return AUDIO_URLS.some((a) => url.href === a) ||
         /cloudinary\.com\/sogbouii\/video\/upload\//.test(url.href);
}
function isFont(url) {
  return /fonts\.(googleapis|gstatic)\.com/.test(url.href);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() =>
          caches.match('./index.html').then((r) => r || caches.match('./'))
        )
    );
    return;
  }

  if (isAudio(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  if (isFont(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetching = fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || fetching;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
