const CACHE = 'johnson-english-v3.0.7';
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest', './assets/icon.svg',
  './css/base.css', './css/layout.css', './css/mobile.css',
  './data/levels.json', './data/modules.json', './data/lessons.json', './data/audio-map.json', './data/audio-map-gb.json',
  './js/app.js', './js/state.js', './js/router.js', './js/audio-engine.js',
  './js/lesson-engine.js', './js/shadowing-engine.js', './js/study-tools.js',
  './js/utils/html-safety.js', './js/components/home-view.js',
  './js/components/levels-view.js', './js/components/module-view.js',
  './js/components/lesson-view.js', './js/components/pronunciation-lesson-view.js',
  './js/components/search-view.js', './js/components/about-view.js',
  './js/components/teacher-guide-view.js', './js/components/lesson-plan-view.js',
  './js/components/not-found-view.js', './js/components/feedback-engine.js',
  './js/modules/grammar/grammar-engine.js', './js/modules/logic/logic-engine.js',
  './js/modules/rhetoric/rhetoric-engine.js', './js/modules/pronunciation/pronunciation-engine.js',
  './js/modules/lesson-plan/lesson-plan-engine.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => {
    if (cached) return cached;
    return fetch(event.request).then((response) => {
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
      return response;
    });
  }));
});
