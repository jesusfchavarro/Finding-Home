var layers = {};

var scale = d3.scale.pow();
scale.exponent(0.5);

var colorScale = scale
   .domain([0, 1])
   .interpolate(d3.interpolateHsl)
   .range(['rgb(49,163,84,0.5)', "rgb(222,45,38,0.5)"])

function markersDisplay(soda) {

   layers["houses-markers"] = new google.maps.Data({
      map: map
   })

   layers["houses-markers"].setStyle(function(f) {
      return {
         visible: +f.getProperty('distance') < 2000,
         icon: {
            url: "images/markers/rent-marker.png",
            scaledSize: {
               width: 40,
               height: 40
            }
         }
      }
   })

   layers["houses-markers"].loadGeoJson(
      soda.query()
      .withDataset('uahe-iimk') //rent houses datasets
      .select("property_name, address, community_area, property_type, phone_number, location, DISTANCE_IN_METERS(location, 'POINT(" + center["lng"] + " " + center["lat"] + ")') as distance")
      .where("location IS NOT NULL")
      .order("distance")
      .geojson(true)
      .getURL()
   );

   layers["houses-markers"].addListener('click', function(e) {
      console.log(e);
      var o = e.feature.f;
      infoWindow.setContent("<strong>Property Name: " + (o.property_name || " ") + "</strong><br>" +
         "Address: " + (o.address || " ") + "<br>" +
         "Community Area: " + (o.community_area || " ") + "<br>" +
         "Property Type: " + (o.property_type || " ") + "<br>" +
         "Phone Number: " + (o.phone_number || " ") + "<br>");
      infoWindow.setPosition(e.latLng);
      infoWindow.open(map);
   })

   soda.query()
      .withDataset('uh4d-zh38') //Bike Racks
      .select("latitude as lat, longitude as lng")
      .limit(5000)
      .getRows()
      .on('success', function(data) {
         layers["bike_racks"] = new MarkerClusterer(map, [], {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            averageCenter: true,
            gridSize: 150,
            minimumClusterSize: 5
         });
         layers["bike_racks"].data = data.map(function(location, i) {
            return new google.maps.Marker({
               position: new google.maps.LatLng(+location.lat, +location.lng),
               icon: {
                  url: "images/bicycle.png",
                  scaledSize: {
                     width: 40,
                     height: 40
                  }
               }
            })
         });;
      })
      .on('error', function(error) {
         console.log("Some data can't load, please refresh the page");
         console.log(error);
      });


   soda.query()
      .withDataset('aavc-b2wj') //Divvy Bike station
      .select("latitude as lat, longitude as lng")
      .where("status='In Service'")
      .limit(5000)
      .getRows()
      .on('success', function(data) {
         layers["bike_divvy"] = new MarkerClusterer(map, [], {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            averageCenter: true,
            gridSize: 150,
            minimumClusterSize: 5
         });
         layers["bike_divvy"].data = data.map(function(location, i) {
            return new google.maps.Marker({
               position: new google.maps.LatLng(+location.lat, +location.lng),
               icon: {
                  url: "images/bicycle2.png",
                  scaledSize: {
                     width: 40,
                     height: 40
                  }
               }
            })
         });
      })
      .on('error', function(error) {
         console.log("Some data can't load, please refresh the page");
         console.log(error);
      });


   layers["community_areas"] = new google.maps.Data({
      map: null,
      style: {
         fillColor: "rgba(0,0,0,0.5)",
         strokeWeight: 1,
         strokeOpacity: 1,
         visible: true
      }
   });

   layers["community_areas"].loadGeoJson(
      soda.query()
      .withDataset('igwz-8jzy') // community areas dataset
      .select("community,area_numbe, the_geom")
      .geojson(true)
      .getURL()
   );

   layers["community_areas"].addListener('click', function(e) {
      soda.query()
         .withDataset("gtem-tu7s")
         .select("assault_homicide as homicide, diabetes_related as diabetes,firearm_related, infant_mortality_rate as infant_mortality, " +
            "stroke_cerebrovascular_disease, tuberculosis, lung_cancer, unemployment")
         .where("community_area='" + e.feature.f.area_numbe + "'")
         .getRows()
         .on("success", function(data) {

            var name = e.feature.f.community;
            var dat = []
            for (var x in data[0]) {
               if (x == "diabetes") {
                  data[0][x] = +data[0][x] / 10
               }
               dat.push({
                  "name": name,
                  "skill": x.replace(/_/g, " "),
                  "value": +data[0][x]
               })
            }
            $("#radarChart")
               .html("<h5>Public Health Statistics</h5>")
            d3plus.viz()
               .container("#radarChart")
               .data(dat)
               .id(["name", "skill"])
               .size("value")
               .height(400)
               .font({
                  size: 14,
                  transform: "capitalize"
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
      .withDataset('6zsd-86xi') //crimes
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



   layers["police-station-markers"] = new google.maps.Data({
      map: null,
      style: {
         icon: {
            url: "images/markers/police-station-marker.png",
            scaledSize: {
               width: 40,
               height: 40
            }
         }
      }
   })

   layers["police-station-markers"].loadGeoJson(
      soda.query()
      .withDataset('9rg7-mz9y') //Police station
      .select("address, district, district_name, location, phone")
      .geojson(true)
      .getURL()
   );

   layers["police-station-markers"].addListener('click', function(e) {
      var o = e.feature.f;
      infoWindow.setContent("<strong>Police Station</strong><br><strong>Disctrict: " + o.district + " - " + (o.district_name || " ") + "</strong><br>" +
         "Address: " + (o.address || " ") + "<br>" +
         "Phone Number: " + (o.phone || " ") + "<br>");
      infoWindow.setPosition(e.latLng);
      infoWindow.open(map);
   })

   layers["fire-station-markers"] = new google.maps.Data({
      map: null,
      style: {
         icon: {
            url: "images/markers/fire-station-marker.png",
            scaledSize: {
               width: 40,
               height: 40
            }
         }
      }
   })

   layers["fire-station-markers"].loadGeoJson(
      soda.query()
      .withDataset('b4bk-rjxe') //Fire station
      .select("address, location")
      .geojson(true)
      .getURL()
   );

   layers["fire-station-markers"].addListener('click', function(e) {
      var o = e.feature.f;
      infoWindow.setContent("<strong>Fire Station</strong><br>Address: " + (o.address || " "));
      infoWindow.setPosition(e.latLng);
      infoWindow.open(map);
   })

   layers["public-health-clinic"] = new google.maps.Data({
      map: null,
      style: {
         icon: {
            url: "images/markers/hospital-marker.png",
            scaledSize: {
               width: 40,
               height: 40
            }
         }
      }
   })

   layers["public-health-clinic"].loadGeoJson(
      soda.query()
      .withDataset('t57k-za2y') //Clinics
      .select("street_address, location,site_name, clinic_type, phone_1")
      .geojson(true)
      .getURL()
   );

   layers["public-health-clinic"].addListener('click', function(e) {
      var o = e.feature.f;
      infoWindow.setContent("<strong>Clinic</strong><br>Name: " + (o.site_name || " ") +
         "<br>Type: " + (o.clinic_type || " ") +
         "<br>Address: " + (o.street_address || " ") +
         "<br>Phone: " + (o.phone_1 || " "));
      infoWindow.setPosition(e.latLng);
      infoWindow.open(map);
   })

   layers["librarie-markers"] = new google.maps.Data({
      map: null,
      style: {
         icon: {
            url: "images/markers/librarie-marker.png",
            scaledSize: {
               width: 40,
               height: 40
            }
         }
      }
   })

   layers["librarie-markers"].loadGeoJson(
      soda.query()
      .withDataset('psqp-6rmg') //libraries
      .select("name_, address, location, phone, cybernavigator, teacher_in_the_library")
      .geojson(true)
      .getURL()
   );

   layers["librarie-markers"].addListener('click', function(e) {
      var o = e.feature.f;
      infoWindow.setContent("<strong>Librarie - " + (o.name_ || " ")+ "</strong><br>" +
         "Address: " + (o.address || " ") + "<br>" +
         "Teacher in the library: " + (o.teacher_in_the_library || " ") + "<br>" +
         "cybernavigator: " + (o.cybernavigator || " ") + "<br>");
      infoWindow.setPosition(e.latLng);
      infoWindow.open(map);
   })
}
