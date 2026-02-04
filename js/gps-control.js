// GPS control similar to Google Maps 'my location' button
(function(){
  function createControl(map){
    if (!map) return;
    var GpsControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        var btn = L.DomUtil.create('a', '', container);
        btn.href = '#';
        btn.title = 'Ma position';
        btn.innerHTML = '<i class="fas fa-location-arrow" style="padding:6px"></i>';
        L.DomEvent.on(btn, 'click', L.DomEvent.stopPropagation)
                 .on(btn, 'click', L.DomEvent.preventDefault)
                 .on(btn, 'click', function(){
                   map.locate({setView:true, maxZoom:16});
                 });
        return container;
      }
    });
    map.addControl(new GpsControl());

    var userMarker, accuracyCircle;
    map.on('locationfound', function(e){
      var gpsIcon = L.divIcon({
        className: 'gps-marker',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      // Draw accuracy circle first so it's underneath the marker
      if (accuracyCircle) { 
        accuracyCircle.setLatLng(e.latlng).setRadius(e.accuracy); 
      } else { 
        accuracyCircle = L.circle(e.latlng, {
          radius: e.accuracy, 
          color: '#1a73e8', 
          fillColor: '#1a73e8', 
          fillOpacity: 0.15,
          weight: 1
        }).addTo(map); 
      }
      
      if (userMarker) { 
        userMarker.setLatLng(e.latlng); 
      } else { 
        userMarker = L.marker(e.latlng, {icon: gpsIcon}).addTo(map); 
      }
    });
    map.on('locationerror', function(){ console.warn('Impossible de récupérer la position'); });
  }

  function waitForMap(cb){
    if (window.map) return cb(window.map);
    var attempts = 0;
    var i = setInterval(function(){
      attempts++;
      if (window.map){ clearInterval(i); cb(window.map); }
      if (attempts > 40) clearInterval(i);
    }, 250);
  }

  waitForMap(createControl);
})();
