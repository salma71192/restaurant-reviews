var CACHE_NAME = 'version-12';

// cache the application shell
var urlsToCache = [
  '/',
  'index.html',
  'restaurant.html',
  'css/styles.css',
  'js/dbhelper.js',
  'js/idb.js',
  'js/main.js',
  'js/restaurant_info.js',
  'img/sandwich.png'
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
});

function createDB() {
  var dbPromise = idb.open('couches-n-restaurants', 5, function(upgradeDb) {
        switch (upgradeDb.oldVersion) {
            case 0:
                // a placeholder case so that the switch block will
                // execute when the database is first created
                // (oldVersion is 0)
            case 1:
                upgradeDb.createObjectStore('restaurants');
                // create 'name' index
            case 2:
                var store = upgradeDb.transaction.objectStore('restaurants');
                store.createIndex('name', 'name', {
                    unique: true
                });
        }
    });

    // Store restaurants in IndexedDB
    function storeRestaurants() {
        dbPromise.then(function(db) {
            DBHelper.fetchRestaurants((error, restaurants) => {
                var tx = db.transaction('restaurants', 'readwrite');
                var store = tx.objectStore('restaurants');
                return Promise.all(restaurants.map(function(restaurant) {
                        return store.add(restaurant);
                    }))
                    .then(() => console.log('All restaurants have been added.'));
            });
        });
    }
}


// Remove old cache versions
self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    // indexedDB
      createDB()
  );
});
