//Declaring global variables

var origin;
var destination;
var geojson = [];
var favourites = [];
var markers = [];
var markersLayer = new L.LayerGroup();
var colorarray = [
  "#FFFFFF",
  "#FFE5CC",
  "#FFCC99",
  "#FFB266",
  "#FF6666",
  "#FF3333",
  "#FF0000",
  "#CC0000",
  "#990000",
  "#660000",
];

//Building the map legend
var legendhtml = "";
for (var i = 0; i < colorarray.length; i++) {
  var k = i * 10 + 10;
  legendhtml +=
    "<input type='text' disabled style='border:none;background-color:" +
    colorarray[i] +
    ";width:30px;color:blue;font:bold 14px Arial;text-align:center' value='" +
    k +
    "'/>";
}
$("#legend").append(legendhtml);

//Event listener for mouseover the legend to see Stringency Index explanation

$("#indexInfo").on("mouseover", function () {
  $("#stringInfo").show();
});

$("#indexInfo").on("mouseout", function () {
  $("#stringInfo").hide();
});

//Getting local stored favorites, including a check to ensure correct data exists

if (localStorage.getItem("favourites") === null) {
  favourites = [];
} else {
  favourites = JSON.parse(localStorage.getItem("favourites"));
  var favcheck = [];
  for (var i = 0; i < favourites.length; i++) {
    if (favourites[i].hasOwnProperty("iso")) {
      favcheck.push(favourites[i]);
    }
  }
  favourites = favcheck;
}

//Implemeting the Leaflet map

var map = L.map("map", { minZoom: 3, maxZoom: 6 }).setView([51.505, -0.09], 3);
map.zoomControl.setPosition("bottomright");
var baselayer = L.tileLayer(
  "https://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
  {
    maxZoom: 22,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }
).addTo(map);

//Adding marker layer to map in order to show and clear

markersLayer.addTo(map);

//Getting the polygon overlay data for the map

$.getJSON(
  "https://www.haulsmart.com/apis/getGeoJson.php?country=",
  function (data) {
    geojson = data;
    L.geoJson(data, {
      style: areaStyle,
      onEachFeature: onEachFeature,
    }).addTo(map);
    $("#country_from").val("AUS");
  }
);

//Iterating through the polygon geosjon data to get name and populate Travelling From and To dropdown lists

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

//Styling the polygon colors

function areaStyle(feature) {
  return {
    fillColor: feature.properties.fillColor,
    fillOpacity: 0.7,
    weight: 1,
    opacity: 1,
  };
}

//Click of polygon to get country and zoom to map bounds
function onClick(e) {
  $("#result").hide();
  destination = e.target.feature.properties.adm0_a3;
  $("#country_to").val(destination);
  getCountryBounds(destination);
}

//Selecting the travel from country list to highlight any mention in travel restrictions, nut only if travel restriction info is visible
$("#country_from").on("change", function () {
  destination = $("#country_to").val();
  if ($("#result").is(":visible")) {
    getCountryData(destination);
  }
});

//Selecting the travel to country list to git country position on map
$("#country_to").on("change", function () {
  $("#result").hide();
  destination = $(this).val();
  getCountryBounds(destination);
});

//Show/hide favorites list
$("#fav").on("click", function () {
  $("#favourites").toggle();
});

//populate locally stored favourites to list
getFavourites();

function getFavourites() {
  $("#favourites").empty();
  for (var i = 0; i < favourites.length; i++) {
    $("#favourites").append(
      "<div class='favs' iso='" +
        favourites[i].iso +
        "'>" +
        favourites[i].country +
        "<i class='bin fa fa-trash'></i></div>"
    );
  }
  $(".favs").on("click", function () {
    $("#result").hide();
    destination = $(this).attr("iso");
    $("#country_to").val(destination);
    getCountryBounds(destination);
  });

  $(".bin").on("click", function () {
    destination = $(this).parent().text();
    $("#remove_text").html(
      "Do you wish to remove " + destination + " from your favourites"
    );
    $("#remove").show();
  });
}

//remove a country from favourites list and local storage
$("#remove_ok").on("click", function () {
  $("#remove").hide();
  var favdata = [];
  for (var i = 0; i < favourites.length; i++) {
    if (favourites[i].iso === destination) {
    } else {
      favdata.push(favourites[i]);
    }
  }
  favourites = favdata;
  localStorage.setItem("favourites", JSON.stringify(favourites));
  getFavourites();
});

//cancel the favourite removal prompt
$("#remove_cancel").on("click", function () {
  $("#remove").hide();
});

//Show/Hide header panel
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
  origin = $("#country_from :selected").text();
  var dest = $("#country_to :selected").text();
  var requestUrl =
    "https://www.haulsmart.com/apis/coviddata2.php?country=" + destination;
  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function (data) {
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
        .append("<i id='addfav' class='far fa-star'></i>")
        .append("<i id='closeButton' class='fas fa-times'></i>")
        .append("<h2>" + dest + "</h2>")
        .append(
          "<img class = 'country-flag' src='https://www.countryflags.io/" +
            data.countrycode +
            "/flat/64.png'>"
        );
      if (!data.info) {
        $("#result").append(
          "<div class = 'result-body'> no information </div>"
        );
      } else {
        $("#result")
          .append("<div class = 'result-body' >" + info + "</div>")
          .append("<div class = 'result-quartne-sec' >" + opt2 + "</div>")
          .append("<div class='result-cEntry' >" + opt3 + "</div>")
          .append("<div>" + data.sources + "</div>")
          .show();

        $("#closeButton").on("click", function () {
          $("#result").hide();
        });

        for (var i = 0; i < favourites.length; i++) {
          if (favourites[i].iso === $("#country_to :selected").val()) {
            $("#addfav").hide();
            break;
          } else {
            $("#addfav").show();
          }
        }

        $("#addfav").on("click", function () {
          $("#addfav").hide();
          if ($(window).width() > 700) {
            $("#favourites").show();
          }
          var obj = {};
          obj.iso = $("#country_to").val();
          obj.country = $("#country_to :selected").text();
          favourites.push(obj);
          localStorage.setItem("favourites", JSON.stringify(favourites));
          getFavourites();
        });
      }
    });
}

//Show country location by getting polygon coords to map bounds, adding a needle marker at center on bounds, displaying a popup window with Covid data, and hiding search/favourites if on a mobile device
function getCountryBounds(destination) {
  markersLayer.clearLayers();
  var bounds = L.latLngBounds();
  for (var j = 0; j < geojson.features.length; j++) {
    if (geojson.features[j].properties.adm0_a3 === destination) {
      if (geojson.features[j].geometry.type == "Polygon") {
        var coords = geojson.features[j].geometry.coordinates[0];
        for (var i = 0; i < coords.length; i++) {
          bounds.extend(L.latLng(coords[i][1], coords[i][0]));
        }
      }
      if (geojson.features[j].geometry.type == "MultiPolygon") {
        if (geojson.features[j].properties.adm0_a3 === "NZL") {
          var coords = geojson.features[j].geometry.coordinates[7][0];
          for (var i = 0; i < coords.length; i++) {
            bounds.extend(L.latLng(coords[i][1], coords[i][0]));
          }
        } else {
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
  }
  map.fitBounds(bounds);
  map.panTo(bounds.getCenter());

  for (var j = 0; j < geojson.features.length; j++) {
    if (geojson.features[j].properties.adm0_a3 === destination) {
      var popupdata = geojson.features[j].properties.cdata;
      var iso_a2 = geojson.features[j].properties.iso_a2;
    }
  }

  if ($(window).width() <= 700) {
    $("#search").hide();
    $("#favourites").hide();
  }

  var html = "<div style='height:200px;overflow:scroll'>";
  for (const [key, value] of Object.entries(popupdata)) {
    html +=
      "<label style='font:normal 12px Arial'>" +
      key.replaceAll("_", " ") +
      " : " +
      value +
      "</label><br/>";
  }
  html += "</div>";
  var marker = L.marker(bounds.getCenter(), { icon: needleIcon })
    .addTo(map)

    .bindPopup(
      "<div><img class='countryFlag' src='https://www.countryflags.io/" +
        iso_a2 +
        "/flat/64.png'><h2 class = 'bindPopupHeader'>" +
        $("#country_to :selected").text() +
        "</h2><br/><label class='travelInfo' onclick=\"getCountryData('" +
        destination +
        "')\" >More Info</label><br/><br/>" +
        html
    )
    .openPopup();

  $(".leaflet-popup-close-button").on("click", function () {
    $("#search").show();
    $("#favourites").show();
  });
  markersLayer.addLayer(marker);
}

var needleIcon = L.icon({
  iconUrl: "assets/images/needle.png",
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
});
