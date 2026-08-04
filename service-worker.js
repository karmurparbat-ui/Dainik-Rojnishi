const CACHE_NAME = 'rojnishi-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './login.html',
  './migrate.html'
];

// ૧. ઇન્સ્ટોલ થતી વખતે એપનો પાયાનો ડેટા સેવ કરશે
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// ૨. જ્યારે ઈન્ટરનેટ ન હોય ત્યારે સેવ કરેલો ડેટા બતાવશે (આ જ તમારી એરર સોલ્વ કરશે)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // જો મેમરીમાં ફાઈલ હોય તો તરત આપી દો
        if (response) {
          return response;
        }
        // નહીંતર ઈન્ટરનેટ પરથી લાવો
        return fetch(event.request).catch(() => {
            // જો ઈન્ટરનેટ પણ ન હોય અને પેજ માંગે, તો index.html બતાવી દો
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        });
      })
  );
});

// ૩. જૂનો કચરો સાફ કરવા માટે
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
