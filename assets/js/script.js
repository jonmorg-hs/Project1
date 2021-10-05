var destination;
var geojson = [];
var favourites = [];
var covidData;
if (localStorage.getItem("favourites") === null) {
  favourites = [{"iso":"CHN","country":"China"},{"iso":"IND","country":"India"}];
  
} else {
  //favourites = [{"iso":"CHN","country":"China"},{"iso":"IND","country":"India"}];
   favourites = JSON.parse(localStorage.getItem("favourites"));
}

var map = L.map("map").setView([51.505, -0.09], 3);
map.zoomControl.setPosition("bottomright");

var baselayer = L.tileLayer(
  "https://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
  {
    maxZoom: 22,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }
).addTo(map);

$.getJSON(
  "https://www.haulsmart.com/apis/getGeoJson.php?country=",
  function (data) {
    console.log(data);
    geojson = data;
    L.geoJson(data, {
      style: areaStyle,
      onEachFeature: onEachFeature,
    }).addTo(map);
    $("#country_from").val("AUS");
  }
);

function onEachFeature(feature, layer) {
  $("#country_from").append(
    "<option value='" +
      feature.properties.adm0_a3 +
      "'>" +
      feature.properties.name +
      "</option>"
  );
  $("#country_to").append(
    "<option value='" +
      feature.properties.adm0_a3 +
      "'>" +
      feature.properties.name +
      "</option>"
  );
  layer.on({
    click: onClick,
  });
}

function onClick(e) {
  destination = e.target.feature.properties.adm0_a3;

  $("#country_to").val(destination);
  getCountryBounds(destination);
  //RUN COVID API AND DISPLAY RESPONSE
  getCountryData(destination);
 
}

function areaStyle(feature) {
  return {
    fillColor: feature.properties.fillColor,
    fillOpacity: 0.3,
    weight: 1,
    opacity: 1,
  };
}
$("#country_from").on("change", function () {
  destination = $("#country_to").val();
  getCountryData(destination);
});
$("#country_to").on("change", function () {
  destination = $(this).val();
  getCountryData(destination);

  getCountryBounds(destination);

});

$("#fav").on("click", function () {
  $("#favourites").toggle();
});

function getFavourites() {
  $("#favourites").empty();
  for (var i = 0; i < favourites.length; i++) {
    $("#favourites").append(
      "<div class='favs' iso='"+favourites[i].iso+"'>" +       
       favourites[i].country +
        "<i class='bin fa fa-trash'></i></div>"
    );
  }
}

getFavourites();


$(".favs").on("click", function () {
  destination = $(this).attr('iso');
  getCountryData(destination);
});

$(".bin").on("click", function () {
  destination = $(this).parent().text();
  $("#remove_text").html(
    "Do you wish to remove " + destination + " from your favourites"
  );
  $("#remove").show();
});

$("#remove_ok").on("click", function () {
  $("#remove").hide();
  var favdata = [];
  for (var i = 0; i < favourites.length; i++) {
    if (favourites[i] === destination) {
    } else {
      favdata.push(favourites[i]);
    }
  }
  favourites = favdata;
  localStorage.setItem("favourites", JSON.stringify(favourites));
  getFavourites();
});

$("#remove_cancel").on("click", function () {
  $("#remove").hide();
});

$("#showHeader").on("click", function () {
  $("header").show();
  $("#map").css({ top: "0", height: "calc(80% - 2px)" });
  $("#result").css({ top: "21%", height: "77%" });
  $("#favourites").css({
    top: "calc(21% + 230px)",
    maxHeight: "calc(79% - 230px)",
  });
  $("#search").css({ top: "21%" });
});

$("#hideHeader").on("click", function () {
  $("header").hide();
  $("#map").css({ top: "51px", height: "calc(100% - 51px)" });
  $("#result").css({ top: "61px", height: "calc(100% - 81px)" });
  $("#favourites").css({ top: "291px", maxHeight: "calc(100% - 241px)" });
  $("#search").css({ top: "61px" });
});

// Get API and display in the result container
function getCountryData(destination) {
  var origin = $("#country_from :selected").text();
  var dest = $("#country_to :selected").text();
  var requestUrl =
    "https://www.haulsmart.com/apis/coviddata2.php?country=" + destination;
  fetch(requestUrl)
    .then(function (response) {
      // console.log(response);
      // console.log(response.json());
      return response.json();
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function (data) {
      console.log(data);
      $("#result")
        .empty()

      
        .append("<h2>" + dest + "</h2>")
        .append(
          "<img src='https://www.countryflags.io/" + dest + "/flat/64.png'>"
        )
        .append("<img id='addfav' style='margin-left:100px' src='assets/images/addfav.png'>")
        .append("<img id='closeButton' style='margin-left:150px' src='assets/images/close.png'>")
      console.log(data.info);
      if (!data.info) {
        $("#result").append(
          "<div class = 'result-body'> no information </div>"
        );
      } else {
        $("#result")
        var info = data.info.replaceAll(
          origin,
          "<span class = 'highlight'>" + origin + "</span>"
        );
        var opt2 = data.optional2.replaceAll(
          origin,
          "<span class = 'highlight'>" + origin + "</span>"
        );
        var opt3 = data.optional3.replaceAll(
          origin,
          "<span class = 'highlight'>" + origin + "</span>"
        );
        $("#result")
          .empty()
          .append(
            "<div style='position:relative'><h2>" +
              $("#country_to :selected").text() +
              "</h2><img id='addfav' style='width:30px;cursor:pointer;position:absolute;right:50px' src='assets/images/addfav.png' /><img id='closeresult' style='margin-left:20px;width:30px;cursor:pointer;position:absolute;right:0px'  onclick-\"$('#result').hide()\" src='assets/images/close.png' /></div>"
          )
          .append("<div class = 'result-body' >" + info + "</div>")
          .append("<div class = 'result-quartne-sec' >" + opt2 + "</div>")
          .append("<div class='result-cEntry' >" + opt3 + "</div>")
          .append("<div>" + data.sources + "</div>")
          .show();
        $("#closeButton").on("click",function(){
          $("#result").hide()
        });
        for (var i=0;i<favourites.length;i++) {
        if (favourites[i].iso===$("#country_to").val()){ $("#addfav").show()
       
         }else{$("#addfav").hide()}}
      $("#addfav").on("click", function () { 
        var obj={};
        obj.iso=$("#country_to").val();
        obj.country=$("#country_to :selected").text();
        favourites.push(obj);
        localStorage.setItem("favourites", JSON.stringify(favourites));
        getFavourites();
      });
    }
    });
  }

function getCountryBounds(destination) {
  console.log("hello");
  var bounds = L.latLngBounds();
  for (var j = 0; j < geojson.features.length; j++) {
    if (geojson.features[j].properties.adm0_a3 == destination) {
      if (geojson.features[j].geometry.type == "Polygon") {
        var coords = geojson.features[j].geometry.coordinates[0];
        for (var i = 0; i < coords.length; i++) {
          bounds.extend(L.latLng(coords[i][1], coords[i][0]));
        }
      }
      if (geojson.features[j].geometry.type == "MultiPolygon") {
        for (
          var k = 0;
          k < geojson.features[j].geometry.coordinates.length;
          k++
        ) {
          var coords = geojson.features[j].geometry.coordinates[k][0];
          for (var i = 0; i < coords.length; i++) {
            bounds.extend(L.latLng(coords[i][1], coords[i][0]));
          }
        }
      }
    }
  }
  map.fitBounds(bounds);
  map.panTo(bounds.getCenter());

  L.marker(bounds.getCenter(), { icon: needleIcon })
    .addTo(map)

    .bindPopup(
      "<div><h2>" +
        $("#country_to :selected").text() +
        "</h2><br><br/><label style='font:normal 16px Arial;cursor:pointer' onclick=\"getCountryData('" +
        destination +
        "')\" >Travel Restrictions</label>"
    )
    .openPopup();
}

var needleIcon = L.icon({
  iconUrl: "assets/images/needle.png",
  iconSize: [200, 200], // size of the icon
  iconAnchor: [100, 200], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -200], // point from which the popup should open relative to the iconAnchor
});

