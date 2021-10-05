var destination;
var geojson = [];
var favourites = [];
var covidData;
if (localStorage.getItem("favourites") === null) {
  favourites = ["New Zealand", "Canada"];
} else {
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
    L.geoJson(data, {
      style: areaStyle,
      onEachFeature: onEachFeature,
    }).addTo(map);
    $("#country_from").val("Australia");
  }
);

function onEachFeature(feature, layer) {
  geojson.push(feature);
  $("#country_from").append(
    "<option value='" +
      feature.properties.name +
      "'>" +
      feature.properties.name +
      "</option>"
  );
  $("#country_to").append(
    "<option value='" +
      feature.properties.name +
      "'>" +
      feature.properties.name +
      "</option>"
  );
  layer.on({
    click: onClick,
  });
}

function onClick(e) {
  destination = e.target.feature.properties.name;
  var coords = e.target.feature.geometry.coordinates[0];
  var bounds = L.latLngBounds();
  for (var i = 0; i < coords.length; i++) {
    bounds.extend(L.latLng(coords[i][1], coords[i][0]));
  }
  map.fitBounds(bounds);
  $("#country_to").val(destination);

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

$("#country_to").on("change", function () {
  destination = $(this).val();
  getCountryData(destination);
  for (var j = 0; j < geojson.length; j++) {
    if (geojson[j]["properties"]["name"] === destination) {
      var coords = geojson[j]["geometry"]["coordinates"][0];
      if (coords.length > 10) {
        break;
      }
    }
  }
  var bounds = L.latLngBounds();
  var latcheck = coords[0][1];
  for (var i = 0; i < coords.length; i++) {
    if (coords[i][1] !== latcheck) {
      bounds.extend(L.latLng(coords[i][1], coords[i][0]));
    }
  }
  //map.fitBounds(bounds);
  
});

$("#fav").on("click", function () {
  $("#favourites").toggle();
});

function getFavourites() {
  $("#favourites").empty();
  for (var i = 0; i < favourites.length; i++) {
    $("#favourites").append(
      "<div class='favs'>" +
        favourites[i] +
        "<i class='bin fa fa-trash'></i></div>"
    );
  }
}

getFavourites();




$(".favs").on("click", function () {
  destination = $(this).text();
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
  var requestUrl =
    "https://www.haulsmart.com/apis/coviddata.php?country=" + destination;
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
        .append("<h2>" + destination + "</h2>")
        .append(
          "<img class = 'country-flag' src='https://www.countryflags.io/" +
            data.countrycode +
            "/flat/64.png'>"
        )

        // (WIP) - once closed button doesnt currently allow re-searching same country
        .append(
          "<img id='favoritButton' style='margin-left:100px' src='assets/images/addfav.png'>"
        )
        .append(
          "<img id='closeButton' style='margin-left:150px' src='assets/images/close.png'>"
        )
        .append("<div class = 'result-body'>" + data.info + "</div>")
        .append(
          "<div class = 'result-quartne-sec'>" + data.optional2 + "</div>"
        )
        .append("<div class = 'result-cEntry'>" + data.optional3 + "</div>")
        .append("<div>" + data.sources + "</div>")
        .show();
      $("#closeButton").on("click", function () {
        $("#result").hide();
      });
      if (!favourites.includes(destination)) {
        $("#favoritButton").show()
       
         }else{$("#favoritButton").hide()}
      $("#addfav").on("click", function () { 
        favourites.push(destination);
        localStorage.setItem("favourites", JSON.stringify(favourites));
        getFavourites();
      });
    });
}
