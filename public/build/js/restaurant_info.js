let restaurant;var map;function display_reviews_from_indexedDB(){idb.open("couches-n-restaurants").then(function(e){return e.transaction("reviews","readonly").objectStore("reviews").getAll()}).then(function(e){fillReviewsHTML(e)})}function AddComment(){document.getElementById("submit").addEventListener("click",function(e){e.preventDefault(),postReview()})}window.initMap=(()=>{fetchRestaurantFromURL((e,t)=>{var n=t.latlng;e?console.error(e):(t.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:n,scrollwheel:!1}),DBHelper.mapMarkerForRestaurant(t,t.map))})}),fetchRestaurantFromURL=(e=>{let t=getParameterByName("id");console.log(t),idb.open("couches-n-restaurants").then(function(e){return e.transaction("restaurants","readonly").objectStore("restaurants").getAll()}).then(function(n){return Promise.all(n.filter(function(e){return t==e.id}).map(function(n){if(console.log(n),t){if(!n)return void console.error(error);fillBreadcrumb(n),fillRestaurantHTML(n),fetch("http://localhost:1337/reviews/",{method:"GET"}).then(e=>e.json()).then(e=>{var n=e.filter(function(e){return e.restaurant_id==t});fillReviewsHTML(n)}).catch(e=>{console.log(e)}),display_reviews_from_indexedDB();var r=!1,a=$(".fa-star");$(".star").click(function(){a.toggleClass("star-color-red"),r=!!a.hasClass("star-color-red"),console.log(r),favorite_restaurant(t,r)}),e(null,n)}else error="No restaurant id in URL",e(error,null)}))})}),fillRestaurantHTML=(e=>{document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=document.getElementById("restaurant-img");t.className="restaurant-img",t.setAttribute("alt",e.name+" restaurant image"),t.src=DBHelper.imageUrlForRestaurant(e),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(e.operating_hours)}),fillRestaurantHoursHTML=(e=>{const t=document.getElementById("restaurant-hours");for(let n in e){const r=document.createElement("tr"),a=document.createElement("td");a.innerHTML=n,r.appendChild(a);const o=document.createElement("td");o.innerHTML=e[n],r.appendChild(o),t.appendChild(r)}}),fillReviewsHTML=(e=>{const t=document.getElementById("reviews-container");if(!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const n=document.getElementById("reviews-list");e.forEach(e=>{n.appendChild(createReviewHTML(e))}),t.appendChild(n)}),createReviewHTML=(e=>{const t=document.createElement("li"),n=document.createElement("p");n.innerHTML=e.name,t.appendChild(n);const r=document.createElement("p");r.innerHTML=e.createdAt,t.appendChild(r);const a=document.createElement("p");a.innerHTML=`Rating: ${e.rating}`,t.appendChild(a);const o=document.createElement("p");return o.innerHTML=e.comments,t.appendChild(o),t}),postReview=(()=>{const e=getParameterByName("id"),t=document.getElementById("username").value,n=document.getElementById("comment").value;let r={restaurant_id:e,name:t,rating:rating,comments:n};fetch("http://localhost:1337/reviews/",{method:"POST",body:JSON.stringify(r),headers:{"content-type":"application/json"}}).then(e=>e.json()).then(e=>{!function(e){idb.open("couches-n-restaurants").then(function(t){var n=t.transaction("reviews","readwrite").objectStore("reviews");return console.log(e),n.add(e)})}(e)}).catch(e=>{console.log(e)})}),AddComment(),fillBreadcrumb=(e=>{document.getElementById("breadcrumb");const t=document.getElementById("breadcrumb-ul"),n=document.createElement("li");n.innerHTML=e.name,t.appendChild(n)}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null});var starHeader=document.getElementById("rating-header"),label=$("label"),rating=0;function favorite_restaurant(e,t){fetch(`http://localhost:1337/restaurants/${e}/?is_favorite=${t}`,{method:"PUT",body:JSON.stringify(),headers:{"content-type":"application/json"}}).then(e=>e.json())}label.click(function(e){starHeader.innerHTML=e.target.getAttribute("title"),rating=e.target.getAttribute("data-value")});