var contentCache = 'restaurants-static-v5';
/*var contentImgsCache = "restaurants-content-imgs";
var allCaches = [
  contentCache,
  contentImgsCache
];*/

// cache the application shell
var urlsToCache = [
  '/',
  'build/css/main.css',
  'build/css/medium600.css',
  'build/css/small.css',
  'build/css/restaurant-info.css',
  'build/js/dbhelper.js',
  'build/js/idb.js',
  'build/js/main.js',
  'build/js/restaurant_info.js',
  'restaurant.html'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(contentCache)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      key != contentCache;
    }).map(function (key) {
      return caches['delete'](key);
    }));
  }).then(function () {
    console.log('WORKER: activate completed.');
  }));
});



self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

