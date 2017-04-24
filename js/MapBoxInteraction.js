setTimeout(function() {
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

$("input.layer-menu2")
   .change(function() {
      var s = this.getAttribute("data-layer");
      s.split(",")
         .map(function(v) {
            var visibility = map.getLayoutProperty(v, 'visibility');
            map.setLayoutProperty(v, 'visibility', (visibility === 'visible' ? "none" : "visible"));
         })

   })

var changeLayer = function(year) {
   map.setPaintProperty("community_areas", "fill-color", {
      "property": "area_numbe",
      "type": "categorical",
      "stops": crimeStops[year]
   })
}


$(".community_area_crime")
   .change(function() {
      var slider = $("#range-crime")
      if (slider[0].disabled) {
         slider[0].disabled = false;
         map.setPaintProperty("community_areas", "fill-color", {
            "property": "area_numbe",
            "type": "categorical",
            "stops": crimeStops[slider[0].value]
         })

      } else {
         slider[0].disabled = true;
         map.setPaintProperty("community_areas", "fill-color", "rgba(0,0,0,0.1)")

      }

   })
