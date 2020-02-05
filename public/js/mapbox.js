/* eslint-disable */
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoienh0b3giLCJhIjoiY2swMml0cGZhMDB5YjNncG5id2pnaXo2aiJ9.hL4bWTb9dgvSVe1nsKBmgA';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/zxtox/ck02iwdqz0dhp1cmu01b7wvxe',
    scrollZoom: false

    //   center: [-118.164181, 34.018618],
    //   zoom: 9,
    //   interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Add marker
    const el = document.createElement('div');
    el.className = 'marker';
    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // app popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // extend map bound to include current lcoation
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
