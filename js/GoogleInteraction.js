/*setTimeout(function() {
   $(".community_area")
      .change(function() {

         var visibility = map.getLayoutProperty("community_areas", 'visibility');

         if (visibility === 'visible') {
            map.setLayoutProperty("community_areas", 'visibility', 'none');
            this.className = '';
         } else {
            this.className = 'active';
            map.setLayoutProperty("community_areas", 'visibility', 'visible');
         }
      });
}, 5000)
*/
$("input.layer-menu2")
   .change(function() {
      var s = this.getAttribute("data-layer");
      if (layers[s].getMarkers()
         .length == 0) {
         layers[s].addMarkers(layers[s].data);
      } else {
         layers[s].clearMarkers();
      }
   })

var changeLayer = function(year) {
   layers["community_areas"].setStyle(function(f) {
      return {
         fillColor: crimeStops[year][f.getProperty("area_numbe")][1],

         strokeOpacity: 1,
         strokeWeight: 1
      }

   })
}


$(".community_area_crime")
   .change(function() {
      var slider = $("#range-crime")
      if (slider[0].disabled) {
         slider[0].disabled = false;
         layers["community_areas"].setStyle(function(f) {
            return {
               fillColor: crimeStops[slider[0].value][f.getProperty("area_numbe")][1],
               strokeColor: crimeStops[slider[0].value][f.getProperty("area_numbe")][1],
               strokeOpacity: 1,
               strokeWeight: 1
            }

         })
      } else {
         slider[0].disabled = true;
         layers["community_areas"].setStyle(function(f) {
            return {
               fillColor: "rgba(0,0,0,0.5)",
               strokeWeight: 1,
               strokeOpacity: 1,
            }
         })
      }
   })
