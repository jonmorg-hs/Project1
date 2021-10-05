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
$("#legend").html(legendhtml);
var covidData;
if (localStorage.getItem("favourites") === null) {
  favourites = [
    { iso: "CHN", country: "China" },
    { iso: "IND", country: "India" },
  ];
} else {
  //favourites = [
  //  { iso: "CHN", country: "China" },
  //  { iso: "IND", country: "India" },
  //];
  favourites = JSON.parse(localStorage.getItem("favourites"));
}

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

markersLayer.addTo(map);

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
  $("#result").hide();
  destination = e.target.feature.properties.adm0_a3;
  $("#country_to").val(destination);
  getCountryBounds(destination);
}

function areaStyle(feature) {
  return {
    fillColor: feature.properties.fillColor,
    fillOpacity: 0.7,
    weight: 1,
    opacity: 1,
  };
}
$("#country_from").on("change", function () {
  destination = $("#country_to").val();
});

$("#country_to").on("change", function () {
  $("#result").hide();
  destination = $(this).val();
  getCountryBounds(destination);
});

$("#fav").on("click", function () {
  $("#favourites").toggle();
});

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
}

getFavourites();

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
  origin = $("#country_from :selected").text();
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
        .append("<div style='position:relative'><h2>" + dest + "</h2>")
        .append(
          "<img style='position:absolute;top:10px;right:150px' src='https://www.countryflags.io/" +
            data.countrycode +
            "/flat/64.png'>"
        )
        .append(
          "<img id='addfav' style='position:absolute;top:10px;right:50px;width:30px' src='assets/images/addfav.png'>"
        )
        .append(
          "<img id='closeButton' style='position:absolute;top:10px;right:10px;width:30px' src='assets/images/close.png'></div>"
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
        console.log(favourites);
        for (var i = 0; i < favourites.length; i++) {
          if (favourites[i].iso === $("#country_to :selected").val()) {
            $("#addfav").hide();
          } else {
            $("#addfav").show();
          }
        }
        $("#addfav").on("click", function () {
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

function getCountryBounds(destination) {
  markersLayer.clearLayers();
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

  for (var j = 0; j < geojson.features.length; j++) {
    if (geojson.features[j].properties.adm0_a3 == destination) {
      var popupdata = geojson.features[j].properties.cdata;
      var iso_a2 = geojson.features[j].properties.iso_a2;
    }
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
      "<div><img style='position:absolute;top:20px;right:10px;width:40px' src='https://www.countryflags.io/" +
        iso_a2 +
        "/flat/64.png'><h2>" +
        $("#country_to :selected").text() +
        "</h2><br/><label style='font:bold 12px Arial;cursor:pointer' onclick=\"getCountryData('" +
        destination +
        "')\" >Travel Restrictions</label><br/><br/>" +
        html
    )
    .openPopup();
  markersLayer.addLayer(marker);
}

var needleIcon = L.icon({
  iconUrl: "assets/images/needle.png",
  iconSize: [50, 50], // size of the icon
  iconAnchor: [25, 50], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -50], // point from which the popup should open relative to the iconAnchor
});
