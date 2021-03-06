let restaurant;
var map;



/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    var latlng = restaurant.latlng;
    if (error) { // Got an error!
      console.error(error);
    } else {
      restaurant.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: latlng,
        scrollwheel: false
      });
      DBHelper.mapMarkerForRestaurant(restaurant, restaurant.map);
    }


  });
}


/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  /*if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }*/
  let id = getParameterByName('id');
  console.log(id)

  idb.open('couches-n-restaurants').then(function(upgradeDb) {
          var tx = upgradeDb.transaction('restaurants', 'readonly');
          var store = tx.objectStore('restaurants');
            return store.getAll();
      }).then(function(restaurants) {
          return Promise.all(restaurants.filter(function(restaurant){
            return id == restaurant.id;
        }).map(function(restaurant) {
            console.log(restaurant);
            if (!id) { // no id found in URL
              error = 'No restaurant id in URL'
              callback(error, null);
            } else {
                if (!restaurant) {
                  console.error(error);
                  return;
                }


                fillBreadcrumb(restaurant);
                fillRestaurantHTML(restaurant);

                // display review from the server
                get_reviews_from_server(id);


                // mark restaurant as a favorite
                display_favorite(restaurant, id);

                callback(null, restaurant);
            }
          }))
      })


  
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.setAttribute('alt', restaurant.name + ' restaurant image');
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML(restaurant.operating_hours);
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.createdAt;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * get reviews from indexedDB then display them in the reviews list.
 */

function update_offline_review() {      
  idb.open('couches-n-restaurants').then(function(upgradeDb) {
      var tx = upgradeDb.transaction('offline-reviews', 'readonly');
      var store = tx.objectStore('offline-reviews');
        return store.getAll();
  }).then(function(reviews) {

     reviews.map(function(review) {
       // Post a review to indexedDB
      fetch('http://localhost:1337/reviews/', {
        method: 'POST',
        body: JSON.stringify(review),
        headers: { 'content-type': 'application/json' }
      }).then(response => response.json())
      .catch(error => { console.log(error); }); 
     })   
  })

  idb.open('couches-n-restaurants').then(function(upgradeDb) {
      var tx = upgradeDb.transaction('offline-reviews', 'readwrite');
      var store = tx.objectStore('offline-reviews');
        return store.clear();
  }).then(function(data) {
    console.log('store cleared');
  })
  
}

if(navigator.onLine) {
  update_offline_review();
}

/**
 * get reviews from server then cache them in the reviews store.
 */

function get_reviews_from_server(restaurant_id) {
  fetch(`http://localhost:1337/reviews/?restaurant_id=${restaurant_id}`, {
    method: 'GET'
  }).then(response => response.json())
    .then(restaurant_reviews => {
       console.log(restaurant_reviews);
       storeReviews(restaurant_reviews);
       fillReviewsHTML(restaurant_reviews);
     }).catch(error => { console.log(error); });
}

/**
 * Put review into reviews store.
 */

function storeReviews(Cached_reviews) {

    // Create reviews object store
    idb.open('couches-n-restaurants').then(function(upgradeDb) {
        var tx = upgradeDb.transaction('reviews', 'readwrite');
        var store = tx.objectStore('reviews');

        return Promise.all(Cached_reviews.map(function(review){
          store.put(review);
        }))
        .then(() => console.log('All reviews have been added.'));

    });

  }

function storeReview(single_review) {

    // Create reviews object store
    idb.open('couches-n-restaurants').then(function(upgradeDb) {
        var tx = upgradeDb.transaction('reviews', 'readwrite');
        var store = tx.objectStore('reviews');
        console.log(single_review);
        store.put(single_review);
    });

    const ul = document.getElementById('reviews-list');
    ul.appendChild(createReviewHTML(single_review));
  }

/**
 * Collect the review form data.
 */

postReview = () => {
   const restaurantId = getParameterByName('id');
   const username = document.getElementById("username").value;
   const comment = document.getElementById("comment").value;
   const star_rate = rating;

// Create review object
let review = {
  restaurant_id: restaurantId,
  name: username,
  rating:  star_rate,
  comments: comment,
}

// Post a review to indexedDB

if(!navigator.onLine) {
    idb.open('couches-n-restaurants').then(function(upgradeDb) {
        var tx = upgradeDb.transaction('offline-reviews', 'readwrite');
        var store = tx.objectStore('offline-reviews');
        return store.put(review);
    });

  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));
} else {

fetch('http://localhost:1337/reviews/', {
    method: 'POST',
    body: JSON.stringify(review),
    headers: { 'content-type': 'application/json' }
  }).then(response => response.json())
    .then(data => {
      console.log(data.id);
      storeReview(data);
     })
  .catch(error => { console.log(error); });

}
}


function AddComment() {
  const submit = document.getElementById("submit");
  submit.addEventListener('click', function(e) {
    e.preventDefault();
    postReview();
  });

}

AddComment();




/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const ul = document.getElementById('breadcrumb-ul');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  ul.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Star Rating.
 */

   var starHeader = document.getElementById('rating-header');
   var label = $('label');
   var rating = 0;
   label.click(function(e) {
     starHeader.innerHTML = e.target.getAttribute("title");
     rating = e.target.getAttribute('data-value');
   });


function favorite_restaurant(restaurant_id, is_favorite, restaurant) {

  fetch(`http://localhost:1337/restaurants/${restaurant_id}/?is_favorite=${is_favorite}`, {
    method: 'PUT',
    body: JSON.stringify(),
    headers: { 'content-type': 'application/json' }
  }).then(response => response.json())
  .then(response => {console.log(response.is_favorite)
  });
  

}

function display_favorite(restaurant, id) {
  var star = $('.fa-star');

       

  $(".star").click(function() {
    star.toggleClass('star-color-red');
    if(star.hasClass('star-color-red')) {
      var favorite = "true";
      favorite_restaurant(id, favorite, restaurant);
    } else {
      var favorite = "false";
      favorite_restaurant(id, favorite, restaurant);
    }
    console.log(favorite);
  });

fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=true`, {
        method: 'GET'
      }).then(response => response.json())
      .then(function (response) {
        console.log(response.is_favorite);
        if(response.is_favorite == "true") {
          star.addClass('star-color-red');
          console.log("I'm red");
        }
        
      });


}
