
var idbApp = (function() {
  'use strict';

  // check for support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  var dbPromise = idb.open('couches-n-restaurants', 1, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        // a placeholder case so that the switch block will
        // execute when the database is first created
        // (oldVersion is 0)
      case 1:
        console.log('Creating the restaurants object store');
        upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});

      // TODO 4.1 - create 'name' index
      case 2:
        console.log('Creating a name index');
        var store = upgradeDb.transaction.objectStore('restaurants');
        store.createIndex('name', 'name', {unique: true});
    }
  });

})();
