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
  "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson",
  function (data) {
    L.geoJson(data, {
      style: areaStyle,
      onEachFeature: onEachFeature,
    }).addTo(map);
    $("#country_from").val("Australia");
  }
);

fetch("https://covid19-api.com/country/all?format=json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    covidData = data;
    console.log(covidData);
  });

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

  $("#result")
    .empty()
    .append("<h2>" + destination + "</h2>")
    .show();
  if (!favourites.includes(destination)) {
    $("#confirm_text").html(
      "Do you wish to add " + destination + " to your favourites"
    );
    $("#confirm").show();
  }
  getCountryResult();
}

function areaStyle(feature) {
  return {
    fillColor: "#0000ff",
    fillOpacity: 0.3,
    weight: 1,
    opacity: 1,
  };
}

$("#country_to").on("change", function () {
  destination = $(this).val();
  $("#result")
    .empty()
    .append("<h2>" + destination + "</h2>")
    .show();
  getCountryResult();
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
  if (!favourites.includes(destination)) {
    $("#confirm_text").html(
      "Do you wish to add " + destination + " to your favourites"
    );
    $("#confirm").show();
  }
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

$("#save").on("click", function () {
  favourites.push(destination);
  localStorage.setItem("favourites", JSON.stringify(favourites));
  $("#confirm").hide();
  getFavourites();
});

$("#cancel").on("click", function () {
  $("#confirm").hide();
});

$(".favs").on("click", function () {
  //ADD get COVID API and response
  $("#result")
    .empty()
    .append("<h2>" + $(this).text() + "</h2>")

    .show();
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
    if (favourites[i] == destination) {
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
  $("#map").css({ top: "0", height: "calc(100% - 302px)" });
  $("#result").css({ top: "310px", height: "calc(100% - 332px)" });
  $("#favourites").css({ top: "540px", maxHeight: "calc(100% - 192px)" });
  $("#search").css({ top: "310px" });
});

$("#hideHeader").on("click", function () {
  $("header").hide();
  $("#map").css({ top: "52px", height: "calc(100% - 52px)" });
  $("#result").css({ top: "62px", height: "calc(100% - 82px)" });
  $("#favourites").css({ top: "292px", maxHeight: "calc(100% - 242px)" });
  $("#search").css({ top: "62px" });
});

//function for later pan to country.
function getCountryResult() {
  for (let i = 0; i < covidData.length; i++) {
    if (covidData[i].country === destination) {
      console.log(covidData[i].deaths);
      console.log(covidData[i].latitude);
      console.log(covidData[i].longitude);
      L.marker([covidData[i].latitude, covidData[i].longitude])
        .addTo(map)
        .bindPopup(
          "<div class='popup'>" +
            covidData[i].country +
            ": " +
            covidData[i].deaths +
            "</div>"
        )
        .openPopup();
      map.panTo([covidData[i].latitude, covidData[i].longitude]);
    }
  }
}
