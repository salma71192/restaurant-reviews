
var idbApp = (function() {
  'use strict';

  // check for support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  var dbPromise = idb.open('couches-n-restaurants', 3, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        // a placeholder case so that the switch block will
        // execute when the database is first created
        // (oldVersion is 0)
      case 1:
        console.log('Creating the restaurants object store');
        upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});

      // create 'name' index
      case 2:
        console.log('Creating a name index');
        var store = upgradeDb.transaction.objectStore('restaurants');
        store.createIndex('name', 'name', {unique: true});
    }
  });

  // Store restaurants in IndexedDB
  (function storeRestaurants() {
    dbPromise.then(function(db) {
      DBHelper.fetchRestaurants((error, restaurants) => {
        console.log(restaurants);

        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');
        return Promise.all(restaurants.map(function(restaurant){
          return store.add(restaurant);
        }))
        .then(() => console.log('All restaurants have been added.'));
      });
    });
  })();
})();
