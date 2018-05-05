class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static fetchRestaurants(e){fetch(DBHelper.DATABASE_URL,{method:"GET"}).then(t=>{if(t.ok)return t.json();{const n=`Request failed. Returned status of ${t.status}`;e(n,null)}},e=>console.log(e.message)).then(function(t){console.log(t),e(null,t)})}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.find(t=>t.id==e);n?t(null,n):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.cuisine_type==e);t(null,n)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.neighborhood==e);t(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,n){DBHelper.fetchRestaurants((r,o)=>{if(r)n(r,null);else{let r=o;"all"!=e&&(r=r.filter(t=>t.cuisine_type==e)),"all"!=t&&(r=r.filter(e=>e.neighborhood==t)),n(null,r)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].neighborhood),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].cuisine_type),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/dist/${e.photograph}.webp`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}let restaurants,neighborhoods,cuisines;!function(){function e(e){return new Promise(function(t,n){e.onsuccess=function(){t(e.result)},e.onerror=function(){n(e.error)}})}function t(t,n,r){var o,s=new Promise(function(s,a){e(o=t[n].apply(t,r)).then(s,a)});return s.request=o,s}function n(e,t,n){n.forEach(function(n){Object.defineProperty(e.prototype,n,{get:function(){return this[t][n]}})})}function r(e,n,r,o){o.forEach(function(o){o in r.prototype&&(e.prototype[o]=function(){return t(this[n],o,arguments)})})}function o(e,t,n,r){r.forEach(function(r){r in n.prototype&&(e.prototype[r]=function(){return this[t][r].apply(this[t],arguments)})})}function s(e,n,r,o){o.forEach(function(o){o in r.prototype&&(e.prototype[o]=function(){return e=this[n],(r=t(e,o,arguments)).then(function(e){if(e)return new i(e,r.request)});var e,r})})}function a(e){this._index=e}function i(e,t){this._cursor=e,this._request=t}function l(e){this._store=e}function c(e){this._tx=e,this.complete=new Promise(function(t,n){e.oncomplete=function(){t()},e.onerror=function(){n(e.error)}})}function u(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new c(n)}function d(e){this._db=e}n(a,"_index",["name","keyPath","multiEntry","unique"]),r(a,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),s(a,"_index",IDBIndex,["openCursor","openKeyCursor"]),n(i,"_cursor",["direction","key","primaryKey","value"]),r(i,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(t){t in IDBCursor.prototype&&(i.prototype[t]=function(){var n=this,r=arguments;return Promise.resolve().then(function(){return n._cursor[t].apply(n._cursor,r),e(n._request).then(function(e){if(e)return new i(e,n._request)})})})}),l.prototype.createIndex=function(){return new a(this._store.createIndex.apply(this._store,arguments))},l.prototype.index=function(){return new a(this._store.index.apply(this._store,arguments))},n(l,"_store",["name","keyPath","indexNames","autoIncrement"]),r(l,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getAllKeys","count"]),s(l,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),o(l,"_store",IDBObjectStore,["deleteIndex"]),c.prototype.objectStore=function(){return new l(this._tx.objectStore.apply(this._tx,arguments))},n(c,"_tx",["objectStoreNames","mode"]),o(c,"_tx",IDBTransaction,["abort"]),u.prototype.createObjectStore=function(){return new l(this._db.createObjectStore.apply(this._db,arguments))},n(u,"_db",["name","version","objectStoreNames"]),o(u,"_db",IDBDatabase,["deleteObjectStore","close"]),d.prototype.transaction=function(){return new c(this._db.transaction.apply(this._db,arguments))},n(d,"_db",["name","version","objectStoreNames"]),o(d,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(e){[l,a].forEach(function(t){t.prototype[e.replace("open","iterate")]=function(){var t,n=(t=arguments,Array.prototype.slice.call(t)),r=n[n.length-1],o=(this._store||this._index)[e].apply(this._store,n.slice(0,-1));o.onsuccess=function(){r(o.result)}}})}),[a,l].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,t){var n=this,r=[];return new Promise(function(o){n.iterateCursor(e,function(e){e?(r.push(e.value),void 0===t||r.length!=t?e.continue():o(r)):o(r)})})})});var p={open:function(e,n,r){var o=t(indexedDB,"open",[e,n]),s=o.request;return s.onupgradeneeded=function(e){r&&r(new u(s.result,e.oldVersion,s.transaction))},o.then(function(e){return new d(e)})},delete:function(e){return t(indexedDB,"deleteDatabase",[e])}};"undefined"!=typeof module?module.exports=p:self.idb=p}();var markers=[];let restaurant;var map;document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})}),fetchCuisines=(()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),n=e.selectedIndex,r=t.selectedIndex,o=e[n].value,s=t[r].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(o,s,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=document.createElement("li");if(e.photograph){const n=document.createElement("img");n.setAttribute("alt",e.name+" restaurant"),n.className="restaurant-img",n.src=DBHelper.imageUrlForRestaurant(e),t.append(n)}const n=document.createElement("h2");n.innerHTML=e.name,t.append(n);const r=document.createElement("p");r.innerHTML=e.neighborhood,t.append(r);const o=document.createElement("p");o.innerHTML=e.address,t.append(o);const s=document.createElement("a");return s.setAttribute("role","button"),s.innerHTML="View Details",s.href=DBHelper.urlForRestaurant(e),t.append(s),t}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})}),"serviceWorker"in navigator&&window.addEventListener("load",function(){navigator.serviceWorker.register("../serviceworker.js").then(function(e){console.log("ServiceWorker registration successful with scope: ",e.scope)},function(e){console.log("ServiceWorker registration failed: ",e)})}),window.initMap=(()=>{fetchRestaurantFromURL((e,t)=>{var n=t.latlng;e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:n,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})}),fetchRestaurantFromURL=(e=>{if(self.restaurant)return void e(null,self.restaurant);const t=getParameterByName("id");t?DBHelper.fetchRestaurantById(t,(t,n)=>{self.restaurant=n,n?(fillRestaurantHTML(),e(null,n)):console.error(t)}):(error="No restaurant id in URL",e(error,null))}),fillRestaurantHTML=((e=self.restaurant)=>{document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=document.getElementById("restaurant-img");t.className="restaurant-img",t.setAttribute("alt",e.name+" restaurant image"),t.src=DBHelper.imageUrlForRestaurant(e),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");for(let n in e){const r=document.createElement("tr"),o=document.createElement("td");o.innerHTML=n,r.appendChild(o);const s=document.createElement("td");s.innerHTML=e[n],r.appendChild(s),t.appendChild(r)}}),fillReviewsHTML=((e=self.restaurant.reviews)=>{const t=document.getElementById("reviews-container"),n=document.createElement("h2");if(n.innerHTML="Reviews",t.appendChild(n),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const r=document.getElementById("reviews-list");e.forEach(e=>{r.appendChild(createReviewHTML(e))}),t.appendChild(r)}),createReviewHTML=(e=>{const t=document.createElement("li"),n=document.createElement("p");n.innerHTML=e.name,t.appendChild(n);const r=document.createElement("p");r.innerHTML=e.date,t.appendChild(r);const o=document.createElement("p");o.innerHTML=`Rating: ${e.rating}`,t.appendChild(o);const s=document.createElement("p");return s.innerHTML=e.comments,t.appendChild(s),t}),fillBreadcrumb=((e=self.restaurant)=>{document.getElementById("breadcrumb");const t=document.getElementById("breadcrumb-ul"),n=document.createElement("li");n.innerHTML=e.name,t.appendChild(n)}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null});