const CACHE_NAME = 'carpeta-virtual-v5';

const ARCHIVOS_OFFLINE = [
  './',
  './index.html',
  './manifest.json',
  './fondo-carnet.png',
  './cedula.jpg',
  './pasaporte.jpg',
  './vouchers.pdf',
  './contrarecibos.pdf',
  './contratos.pdf',
  './nda.pdf',
  './cis.pdf',
  './w8.pdf',
  './ddr.pdf'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ARCHIVOS_OFFLINE.map(url => {
          return cache.add(url).catch(err => console.log('Omitido:', url));
        })
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// NETWORK FIRST con ignoreSearch para evitar errores con ?v=1
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
