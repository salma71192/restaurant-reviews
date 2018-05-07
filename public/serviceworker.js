
var CACHE_NAME = 'version-13';

// cache the application shell
var urlsToCache = [
  '/',
  'index.html',
  'restaurant.html',
  'build/css/',
  'build/js/',
  'img/bread128x128.png',
  'img/bread256x256.png',
  'img/bread512x512.png',

];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercept network requests

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }
      return fetch(event.request)
      // Add fetched files to the cache
      .then(function(response) {
        return caches.open(CACHE_NAME).then(function(cache) {
          return fetch(event.request).then(function(response) {
            cache.put(event.request, response.clone());
            return response;
          })
        });
      });
    })
  );
})



// Remove old cache versions
self.addEventListener('activate', function(event) {
  console.log('Activating new service worker...');
    event.waitUntil(

    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          // Return true if you want to remove this cache,
          // but remember that caches are shared across
          // the whole origin
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  )
});
