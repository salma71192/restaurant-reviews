var CACHE_NAME = 'my-site-cache-v1';

// cache the application shell
var urlsToCache = [
  '/',
  '/css/',
  '/js/',
  '/data/',
  '/img/'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercept network requests

self.addEventListener('fetch', function(event) {
  console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('Found ', event.request.url, ' in cache');
        return response;
      }
      console.log('Network request for ', event.request.url);
      return fetch(event.request)

      // Add fetched files to the cache

    }).catch(function(error) {

      // Respond with custom offline page

    })
  );
});
