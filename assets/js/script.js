var destination;
var geojson = [];
var favourites = [];
if(localStorage.getItem("favourites")==null){
favourites = ['New Zealand','Canada'];
} else {
favourites = JSON.parse(localStorage.getItem("favourites"));    
}

var map = L.map('map').setView([51.505, -0.09], 3);
map.zoomControl.setPosition('bottomright');

var baselayer = L.tileLayer('https://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', { maxZoom: 22,attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);

$.getJSON('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson', function(data) {
  L.geoJson(data,{
    style: areaStyle,
    onEachFeature: onEachFeature
}).addTo(map);
$('#country_from').val('Australia');
});

function onEachFeature(feature, layer) {
    geojson.push(feature);
    $('#country_from').append("<option value='"+feature.properties.name+"'>"+feature.properties.name+"</option>");
    $('#country_to').append("<option value='"+feature.properties.name+"'>"+feature.properties.name+"</option>");
    layer.on({
        click: whenClicked
    });
}

function whenClicked(e) { 
  var coords = e.target.feature.geometry.coordinates[0];
  var bounds = L.latLngBounds();
  for(var i=0;i<coords.length-1;i++){
  bounds.extend(L.latLng(coords[i][1], coords[i][0]));
  }
  map.fitBounds(bounds);
  $('#country_to').val(e.target.feature.properties.name);
  destination = e.target.feature.properties.name;
  //RUN COVID API AND DISPLAY RESPONSE
  $('#result').empty().append("<h2>"+e.target.feature.properties.name+"</h2>").show();
  if(favourites.includes(e.target.feature.properties.name)){} else {
    $("#confirm_text").html("Do you wish to add "+e.target.feature.properties.name+" to your favourites");
    $("#confirm").show(); 
 }
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

$("#country_to").on("change",function(){
    $('#result').empty().append("<h2>"+$(this).val()+"</h2>").show();
    destination = $(this).val();
    var check=0;
    for(var j=0;j<geojson.length;j++){
    if(check==0){
    if(geojson[j]['properties']['name']==$(this).val()){
      var coords = geojson[j]['geometry']['coordinates'][0];
      if(coords.length>10){
      check = 1;
      }
    }}}
    var bounds = L.latLngBounds();
    var latcheck = coords[0][1];
    console.log(latcheck);
    for(var i=0;i<coords.length;i++){
    if(coords[i][1]==latcheck){} else {
    bounds.extend(L.latLng(coords[i][1], coords[i][0]));
    }}
    map.fitBounds(bounds);
    if(favourites.includes($(this).val())){} else {
       $("#confirm_text").html("Do you wish to add "+$(this).val()+" to your favourites");
       $("#confirm").show(); 
    }
});

$("#fav").on("click",function(){
  $("#favourites").show();
});

function getFavourites(){
$("#favourites").empty();
for(var i=0;i<favourites.length;i++){
$("#favourites").append("<div class='favs'>"+favourites[i]+"</div>"); 
}
}

getFavourites();

$("#save").on("click",function(){
    favourites.push(destination);
    localStorage.setItem("favourites",JSON.stringify(favourites));
    $("#confirm").hide();
    getFavourites();
  });

  $("#cancel").on("click",function(){
    $("#confirm").hide();
  });

  $(".favs").on("click",function(){
    $('#result').empty().append("<h2>"+$(this).html()+"</h2>").show(); 
  })

  $('.favs').mousedown(function(event) {
    switch (event.which) {
        case 1:
          $('#result').empty().append("<h2>"+$(this).html()+"</h2>").show(); 
            break;
        case 2:
            break;
        case 3:
            var check = confirm("Do you want to remove "+$(this).html()+" from your favorites?");
            if(check){
                var favdata = [];
                for(var i=0;i<favourites.length;i++){
                if(favourites[i]==$(this).html()) {}  else {
                  favdata.push(favourites[i]);  
                }  
            }
            favourites=favdata;
            localStorage.setItem('favourites',JSON.stringify(favourites));
            getFavourites();
        } 
            break;
        default:
    }
});
  