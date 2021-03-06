

let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */

 $(document).ready(function() {
    // Do something
    updateRestaurants();
    fetchNeighborhoods();
    fetchCuisines();

});
/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    
    idb.open('couches-n-restaurants').then(function(upgradeDb) {
          var tx = upgradeDb.transaction('neighborhoods', 'readonly');
          var store = tx.objectStore('neighborhoods');
            return store.getAll();
      }).then(function(indexedNeighborhoods) {
          if (indexedNeighborhoods.length === 0) { // Got an error!
            console.error(error);
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
          } else {            
            console.log(indexedNeighborhoods);
            console.log('37');
            fillNeighborhoodsHTML(indexedNeighborhoods);

          }
      })
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods) => {
  console.log(neighborhoods[0].neighborhoodNames);
  const select = document.getElementById('neighborhoods-select');
  var neighborhoodName = neighborhoods[0].neighborhoodNames;
  neighborhoodName.forEach(neighborhood => {
    const option = document.createElement('option');
      console.log(neighborhood)
      option.innerHTML = neighborhood
      option.value = neighborhood;
      select.append(option);
    
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    idb.open('couches-n-restaurants').then(function(upgradeDb) {
          var tx = upgradeDb.transaction('cuisines', 'readonly');
          var store = tx.objectStore('cuisines');
            return store.getAll();
      }).then(function(indexedCcuisines) {
          if (indexedCcuisines.length === 0) { // Got an error!
            console.error(error);
            self.cuisines = cuisines;
            fillCuisinesHTML();
          } else {            
            console.log(indexedCcuisines);
            console.log('78');
            fillCuisinesHTML(indexedCcuisines);
          }
      })

  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines) => {
  console.log(cuisines[0].cuisines);
  const select = document.getElementById('cuisines-select');
  var cuisinesNames = cuisines[0].cuisinesNames;
  cuisinesNames.forEach(cuisine => {
    const option = document.createElement('option');
      console.log(cuisine)
      option.innerHTML = cuisine
      option.value = cuisine;
      select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {

    idb.open('couches-n-restaurants').then(function(upgradeDb) {
          var tx = upgradeDb.transaction('restaurants', 'readonly');
          var store = tx.objectStore('restaurants');
            return store.getAll();
      }).then(function(indexedRestaurants) {
          if (indexedRestaurants.length === 0) { // Got an error!
            console.error(error);
            resetRestaurants(restaurants);
            fillRestaurantsHTML(self.restaurants);
          } else {            
            console.log(indexedRestaurants);
            console.log('109');
            resetRestaurants(indexedRestaurants);
            fillRestaurantsHTML(indexedRestaurants);
          }
      })

    

  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap(restaurants);
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {

  const li = document.createElement('li');

  if(restaurant.photograph) {
    const image = document.createElement('img');
    image.setAttribute('alt', restaurant.name + ' restaurant');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    li.append(image);
  }

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.setAttribute('role', 'button');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

/**
 * Register a service worker.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('../serviceworker.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
