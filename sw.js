self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('fox-store').then(function(cache) {
     return cache.addAll([
       './',
       './index.html',
       './assets/vendor/bootstrap/4.5.2/bootstrap.min.css',
       './assets/vendor/pickr/themes/monolith.min.css',
       './assets/vendor/jquery/3.5.1/jquery.min.js',
       './assets/vendor/bootstrap/4.5.2/bootstrap.bundle.min.js',
       './assets/vendor/pickr/pickr.min.js'
       
     ]);
   })
 );
});

self.addEventListener('fetch', function(e) {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});