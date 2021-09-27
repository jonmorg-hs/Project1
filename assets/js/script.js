
var map = L.map('map').setView([51.505, -0.09], 13);
map.zoomControl.setPosition('bottomright');

if(navigator.onLine){
var baselayer = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', { maxZoom: 22,attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
}

$.getJSON('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson', function(data) {
  L.geoJson(data,{
    style: areaStyle,
    onEachFeature: onEachFeature
}).addTo(map);
});

function onEachFeature(feature, layer) {
    layer.on({
        click: whenClicked
    });
}

function whenClicked(e) {

  alert(e.target.feature.properties.name);
}

function areaStyle(feature){
	return {
  	fillColor: '#0000ff',
    fillOpacity: 0.3,
    weight: 1,
    opacity: 1,
    color: '#ff0000',
  }
};
  