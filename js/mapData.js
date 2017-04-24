var route = {
   "type": "Feature",
   "properties": {},
   "geometry": {
      "type": "LineString",
      "coordinates": [center]
   }
}

function getDirections(start, end = center, mode) {
   var data = {}
   if (!mode) {
      mode = $("input[name=transport]:checked")
         .val();
   }
   $.ajax({
         url: "https://api.mapbox.com/directions/v5/mapbox/" + mode + "/" + start.join(",") + ";" + end.join(","),
         data: {
            "access_token": mapboxgl.accessToken,
            "geometries": "geojson"
         },
         "async": false
      })
      .done(function(d) {
         data = d.routes[0];
      })
      .fail(function() {
         console.log("Fail to get directions, please try again");
      })
   return data
}
var houseMarkers = [];
(function(soda) {
   map.on('load', function() {
      map.addSource("route", {
         "type": "geojson",
         "data": route
      });

      map.addLayer({
         "id": "route",
         "type": "line",
         "source": "route",
         "layout": {
            "line-join": "round",
            "line-cap": "round"
         },
         "paint": {
            "line-color": "#4286f4",
            "line-width": 7
         }
      });

      soda.query()
         .withDataset('uahe-iimk') //rent houses datasets
         .select("property_name, address, community_area, property_type, phone_number, longitude, latitude, DISTANCE_IN_METERS(location, 'POINT(" + center[0] + " " + center[1] + ")') as distance")
         .where("location IS NOT NULL")
         .order("distance")
         .getRows()
         .on('success', function(data) {
            function housesPopup(e) {
               var direction = getDirections(map.unproject([e.x - 10, e.y + 15])
                  .toArray());
               route.geometry = direction.geometry
               map.getSource('route')
                  .setData(route);
               setTimeout(function() {
                  var popup = $("div.mapboxgl-popup-content");
                  var t = parseInt(direction.duration / 60)
                  if (popup[0] && !popup[0].querySelector("p")) {
                     popup.append("<strong>Transportation to UIC:" + $("input[name=transport]:checked")
                        .val() + "</strong><p>Distance: " + (direction.distance > 1000 ? ((direction.distance / 1000)
                           .toFixed(2) + "Km") : direction.distance.toFixed(2) + "m") +
                        "<br>Estimated travel time: " + parseInt(t / 60) + "h " + t % 60 + "m</p>");
                  }
               }, 0.010)
            }

            for (var i = 0; i < data.length; i++) {
               var point = document.createElement('div');
               var coord = [data[i].longitude, data[i].latitude];
               point.addEventListener("click", housesPopup);
               var popup = new mapboxgl.Popup({
                     offset: 25
                  })
                  .setHTML("<strong>Property Name: " + (data[i].property_name || " ") + "</strong><br>" +
                     "Address: " + (data[i].address || " ") + "<br>" +
                     "Community Area: " + (data[i].community_area || " ") + "<br>" +
                     "Property Type: " + (data[i].property_type || " ") + "<br>" +
                     "Phone Number: " + (data[i].phone_number || " ") + "<br>");


               if(data[i].distance > 5000){
                 point.className = "houses-markers none";
               }else{
                 point.className = "houses-markers";
               }
               if (coord[0] && coord[1]) {
                  new mapboxgl.Marker(point, {
                        offset: [-15, -15]
                     })
                     .setLngLat(coord)
                     .setPopup(popup) // sets a popup on this marker
                     .addTo(map);
                  houseMarkers.push({distance:data[i].distance,html:point});
               }

            }
         })
         .on('error', function(error) {
            console.log("Some data can't load, please refresh the page");
            console.error(error);
         });

      var communityQuery = soda.query()
         .withDataset('igwz-8jzy') // community areas dataset
         .select("community,area_numbe, the_geom")
         .geojson(true)


      map.addLayer({
         "id": "community_areas",
         "type": "fill",
         "source": {
            "type": "geojson",
            "data": communityQuery.getURL()
         },
         "paint": {
            "fill-outline-color": "rgba(0,0,0,1)",
            "fill-color": "rgba(0,0,0,0.1)",
            "fill-opacity": 0.5
         },
         "layout": {
            'visibility': 'none'
         }
      });

      var bikesRacks = soda.query()
         .withDataset('uh4d-zh38') //Bike Racks
         .select("location")
         .limit(5000)
         .geojson(true)

      map.addSource("bikesRacks", {
         type: "geojson",
         data: bikesRacks.getURL(),
         cluster: true,
         clusterRadius: 50
      });

      map.addLayer({
         "id": "unclustered-bikeRacks",
         "type": "symbol",
         "source": "bikesRacks",
         "filter": ["!has", "point_count"],
         "layout": {
            "icon-image": "bicycle-15",
            "icon-size": 1.3,
            "visibility": "none"
         },
         "paint": {
            "icon-color": "#43aaef"
         }
      });

      map.addLayer({
         "id": "clustered-bikeRacks",
         "type": "circle",
         "source": "bikesRacks",
         "paint": {
            "circle-color": "#43aaef",
            "circle-radius": 18
         },
         "filter": [">=", "point_count", 2],
         "layout": {
            "visibility": "none"
         }
      });

      map.addLayer({
         "id": "bikeRacks-count",
         "type": "symbol",
         "source": "bikesRacks",
         "layout": {
            "text-field": "{point_count} racks",
            "text-font": [
               "DIN Offc Pro Medium",
               "Arial Unicode MS Bold"
            ],
            "text-size": 10,
            "visibility": "none"
         },
         "filter": [">=", "point_count", 2]
      });

      var bikesDivvy = soda.query()
         .withDataset('aavc-b2wj') //Divvy Bike station
         .select("location, total_docks")
         .where("status='In Service'")
         .limit(5000)
         .geojson(true)

      map.addSource("divvyStations", {
         type: "geojson",
         data: bikesDivvy.getURL(),
         cluster: true,
         clusterRadius: 50
      });

      map.addLayer({
         "id": "unclustered-bikesDivvy",
         "type": "circle",
         "source": "divvyStations",
         "paint": {
            "circle-color": "#dc7ded",
            "circle-radius": 18
         },
         "filter": ["!has", "point_count"],
         "layout": {
            "visibility": "none"
         }
      });
      map.addLayer({
         "id": "docks-count",
         "type": "symbol",
         "source": "divvyStations",
         "layout": {
            "text-field": "{total_docks} docks",
            "text-font": [
               "DIN Offc Pro Medium",
               "Arial Unicode MS Bold"
            ],
            "text-size": 11,
            "visibility": "none"
         },
         "filter": ["!has", "point_count"]
      });
      map.addLayer({
         "id": "clustered-bikesDivvy",
         "type": "circle",
         "source": "divvyStations",
         "paint": {
            "circle-color": "#ce67e0",
            "circle-radius": 18
         },
         "filter": [">=", "point_count", 2],
         "layout": {
            "visibility": "none"
         }
      });

      map.addLayer({
         "id": "bikesDivvy-count",
         "type": "symbol",
         "source": "divvyStations",
         "layout": {
            "text-field": "{point_count} divvy",
            "text-font": [
               "DIN Offc Pro Medium",
               "Arial Unicode MS Bold"
            ],
            "text-size": 10,
            "visibility": "none"
         },
         "filter": [">=", "point_count", 2]
      });

      var scale = d3.scale.pow();
      scale.exponent(0.5);
      var colorScale = scale
         .domain([0, 1])
         .interpolate(d3.interpolateHsl)
         .range(['rgb(49,163,84,0.5)', "rgb(222,45,38,0.5)"])

      var a = soda.query()
         .withDataset('6zsd-86xi')//crimes
         .select("year,community_area,count(*)")
         .where("community_area IS NOT NULL")
         .group("community_area,year")
         .order("community_area")
         .limit(5000)
         .getRows()
         .on('success', function(data) {
            window.crimeStops = {};
            for (var i = 0; i < data.length; i++) {
               crimeStops[data[i].year] = crimeStops[data[i].year] || [
                  ["0", "0"]
               ];
               crimeStops[data[i].year][data[i].community_area] = ([data[i].community_area, data[i].count]);

            };
            Object.getOwnPropertyNames(crimeStops)
               .forEach(function(val) {
                  var max = d3.max(crimeStops[val], function(d) {
                     return +d[1]
                  })
                  crimeStops[val] = crimeStops[val].map(function(v) {
                     v["count"] = v[1];
                     v[1] = colorScale(v[1] / max);
                     return v;
                  })
                  //console.log(crimeStops[val]);
               })
            //console.log(crimeStops);
         })
         .on('error', function(error) {
            console.log("Some data can't load, please refresh the page");
            console.log(error);
         });

      map.on('click', "community_areas", function(e) {
         //console.log(e);
         new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("<p><strong>" + e.features[0].properties.area_numbe + " - " + e.features[0].properties.community + ": </strong><br>" +
               "Crimes in 2017: " + crimeStops[2017][e.features[0].properties.area_numbe].count + "<br>" +
               "" +
               "</p>")
            .addTo(map);
         soda.query()
            .withDataset("gtem-tu7s")
            .select("assault_homicide as homicide, diabetes_related as diabetes,firearm_related, infant_mortality_rate as infant_mortality, " +
               "stroke_cerebrovascular_disease, tuberculosis, lung_cancer, unemployment")
            .where("community_area='" + e.features[0].properties.area_numbe + "'")
            .getRows()
            .on("success", function(data) {

                  var name = e.features[0].properties.community;
                  var dat = []
                  for (var x in data[0]) {
                    if(x == "diabetes"){
                      data[0][x] =+data[0][x]/10
                    }
                     dat.push({
                        "name": name,
                        "skill": x.replace(/_/g, " "),
                        "value": +data[0][x]
                     })
                  }
                $("#radarChart").html("<h5>Public Health Statistics</h5>")
               d3plus.viz()
                  .container("#radarChart")
                  .data(dat)
                  .id(["name", "skill"])
                  .size("value")
                  .height(400)
                  .font({
                    size:14,
                    transform:"capitalize"
                  })
                  .type("radar")
                  .draw();

            })
            .on('error', function(error) {
               console.log("Some data can't load, please refresh the page");
               console.error(error);
            });
      });

      soda.query()
         .withDataset('9rg7-mz9y') //Police station
         .select("address, district, district_name, latitude, longitude, phone")
         .getRows()
         .on('success', function(data) {
            for (var i = 0; i < data.length; i++) {
               var point = document.createElement('div');
               var coord = [data[i].longitude, data[i].latitude];
               var popup = new mapboxgl.Popup({
                     offset: 25
                  })
                  .setHTML("<strong>Police Station</strong><br><strong>Disctrict: " + data[i].district + " - " + (data[i].district_name || " ") + "</strong><br>" +
                     "Address: " + (data[i].address || " ") + "<br>" +
                     "Phone Number: " + (data[i].phone || " ") + "<br>");

               point.className = "police-station-markers none"
               if (coord[0] && coord[1]) {
                  new mapboxgl.Marker(point, {
                        offset: [-15, -15]
                     })
                     .setLngLat(coord)
                     .setPopup(popup) // sets a popup on this marker
                     .addTo(map);
               }
            }
         })
         .on('error', function(error) {
            console.log("Some data can't load, please refresh the page");
            console.error(error);
         });

      soda.query()
         .withDataset('b4bk-rjxe') //Fire station
         .select("address, location")
         .getRows()
         .on('success', function(data) {
            for (var i = 0; i < data.length; i++) {
               var point = document.createElement('div');
               var popup = new mapboxgl.Popup({
                     offset: 25
                  })
                  .setHTML("<strong>Fire Station</strong><br>Address: " + (data[i].address || " "));

               point.className = "fire-station-markers none"
               new mapboxgl.Marker(point, {
                     offset: [-16, -16]
                  })
                  .setLngLat(data[i].location.coordinates)
                  .setPopup(popup) // sets a popup on this marker
                  .addTo(map);
            }
         })
         .on('error', function(error) {
            console.log("Some data can't load, please refresh the page");
            console.error(error);
         });

      soda.query()
         .withDataset('psqp-6rmg') //libraries
         .select("address, location, phone, cybernavigator, teacher_in_the_library")
         .getRows()
         .on('success', function(data) {
            for (var i = 0; i < data.length; i++) {
               var point = document.createElement('div');
               var popup = new mapboxgl.Popup({
                     offset: 25
                  })
                  .setHTML("<strong>Disctrict: " + data[i].name_ + " - " + (data[i].district_name || " ") + "</strong><br>" +
                     "Address: " + (data[i].address || " ") + "<br>" +
                     "Teacher in the library: " + (data[i].teacher_in_the_library || " ") + "<br>" +
                     "cybernavigator: " + (data[i].cybernavigator || " ") + "<br>"
                   );

               point.className = "librarie-markers none"
               new mapboxgl.Marker(point, {
                     offset: [-16, -16]
                  })
                  .setLngLat(data[i].location.coordinates)
                  .setPopup(popup) // sets a popup on this marker
                  .addTo(map);
            }
         })
         .on('error', function(error) {
            console.log("Some data can't load, please refresh the page");
            console.error(error);
         });



   })



})(new soda.Consumer('data.cityofchicago.org'))
