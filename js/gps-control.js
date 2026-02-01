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
      if (userMarker) { userMarker.setLatLng(e.latlng); } else { userMarker = L.marker(e.latlng).addTo(map); }
      if (accuracyCircle) { accuracyCircle.setLatLng(e.latlng).setRadius(e.accuracy); } else { accuracyCircle = L.circle(e.latlng, {radius: e.accuracy, color:'#2b5d6f', fillColor:'#2b5d6f', fillOpacity:0.15}).addTo(map); }
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
