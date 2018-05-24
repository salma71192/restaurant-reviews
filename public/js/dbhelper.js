/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change the port to the node server and edit the url the the restaurants API.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // Use fetch method to get the restaurants for the server.
    fetch(DBHelper.DATABASE_URL, {
      method: 'GET'
    }).then((response) => {
      if(response.ok) {
        return response.json();
      } else {
        const error = (`Request failed. Returned status of ${response.status}`);
        callback(error, null);
      }
    }, networkError => console.log(networkError.message))
    .then(function(response) {
      console.log(response);
      const restaurants = response;
      callback(null, restaurants);
    })
  //  .catch(err => requetError(err));
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/build/img/${restaurant.photograph}.webp`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}

// Create indexedB
function createDB() {
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
        // Restaurant object store
        console.log('Creating the restaurants object store');
        upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        // Reviews object store
        console.log('making a new Reviews object store');
        upgradeDb.createObjectStore('reviews', {keyPath: 'id'});


      // create 'name' index
      case 2:
        // create 'name' index for restaurants
        console.log('Creating a name index for restaurant object store');
        var store = upgradeDb.transaction.objectStore('restaurants');
        store.createIndex('name', 'name', {unique: true});

        // create 'name' index for reviews
        console.log('Creating a name index for reviews object store');
        var store = upgradeDb.transaction.objectStore('reviews');
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
          store.add(restaurant);
        }))
        .then(() => console.log('All restaurants have been added.'));
      });
    });
  })();
}
createDB();
