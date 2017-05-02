function metersToPixelsAtMaxZoom(meters, latitude) {
   return meters / 0.075 / Math.cos(latitude * Math.PI / 180)
}

var isDragging;
var isCursorOverPoint;
var drag = [];
var center = {
   lng: -87.6505,
   lat: 41.8708
};
var dataSets = {};
var profile = "walking";

var infoWindow;

var map;

var colors = d3.scale.category10()
   .domain([0, 10])
   .range();

var main = function() {

   infoWindow = new google.maps.InfoWindow({
      content: ''
   });

   map = new google.maps.Map(document.getElementById('map'), {
      center: center,
      zoom: 14
   });

   var UniversityMarker = new google.maps.Marker({
      position: center,
      icon: {
         url: "images/markers/university-marker.png",
         scaledSize: {
            width: 60,
            height: 60
         }
      },
      map: map
   });

   UniversityMarker.addListener('click', function() {
      infoWindow.setContent('Department of Computer Science <br> University of Illinois, Chicago');
      infoWindow.open(map, UniversityMarker);
   });
   var sodaC = new soda.Consumer('data.cityofchicago.org');
   markersDisplay(sodaC);

   //loupes
   drag = [new google.maps.LatLng(center["lat"] + 0.01, center["lng"]), new google.maps.LatLng(center["lat"] - 0.01, center["lng"]), new google.maps.LatLng(center["lat"], center["lng"] - 0.02)]


   drag = drag.map(function(v, i) {
      return new google.maps.Circle({
         center: v,
         radius: 1000,
         draggable: true,
         strokeWeight: 0,
         fillColor: colors[i],
         fillOpacity: 0.5,
         map: map,
         zIndex: 100
      });
   })

   for (var i = 0; i < drag.length; i++) {
     drag[i].addListener('dragend',function(e) {
       var coords = e.lngLat;

       var select = drag.map(function(curr, i) {
          var coord = curr.getCenter();
          return "sum(case(within_circle(location," + coord.lat() + "," + coord.lng() +
             ",1000),1,true,0)) as loupe" + i
       });
       var so = new soda.Consumer('data.cityofchicago.org')
       var select = select.join(",");


       var within = function(name, lat, long, radius) {
          return "within_circle(" + name + "," + lat + "," + long + "," + radius + ")";
       };

       var ca = [];
       var wh = []
       var co = [];

       for (var i = 0; i < drag.length; i++) {
         co = drag[i].getCenter();
         var tmp = within("the_geom",co.lat(), co.lng(), 1500);
         ca.push(tmp + "," + i);
         wh.push(tmp);
       }
       ca = ca.join(",");
       wh = wh.join(" OR ");
       so.query()
          .withDataset('eix4-gf83')
          .select("facility_n as Name, CASE(" + ca + /*",true,-1*/ ") as loupe, count(*)")
          .group("facility_n, loupe")
          .where(wh)
          .order("loupe")
          .limit(5000)
          .getRows()
          .on('success', function(data) {
             data = data.map(function(curr) {
                return {
                   Name: curr.Name,
                   loupe: "Loupe " + curr.loupe,
                   Nid: +curr.loupe,
                   count: +curr.count
                }
             });

             $("#treeMap1")
                .html("<h5>Park District Facilities by loupe area</h5>")
             charts["treeMap"] = d3plus.viz()
                .container("#treeMap1")
                .data(data)
                .type("tree_map")
                .id(["loupe", "Name"])
                .size("count")
                .height(400)
                .width(400)
                .color({
                  heatmap: colors,
                  value: function(d){
                    if( typeof d.Name != 'string'){
                      return colors[d.loupe.charAt(6)]
                    }else{
                      return d.Name.length
                    }
                  }

                })
                .draw()
          });

       $.when(
             $.ajax(so.query()
                .withDataset('uahe-iimk')
                .select(select)
                .getURL()),
             $.ajax(so.query()
                .withDataset('9rg7-mz9y')
                .select(select)
                .getURL()),
             $.ajax(so.query()
                .withDataset('b4bk-rjxe')
                .select(select)
                .getURL()),
             $.ajax(so.query()
                .withDataset('t57k-za2y')
                .select(select)
                .getURL()))
          .done(function(v1, v2, v3) {
             var columns = [];
             for (var i = 1; i <= drag.length; i++) {
                columns.push(["Loupe " + i])
             }
             for (var i = 0; i < arguments.length; i++) {
                for (var l in arguments[i][0][0]) {
                   var j = parseInt(l.charAt(l.length - 1));
                   columns[j].push(arguments[i][0][0][l])
                }
             }
             charts["buildingChart"].load({
                columns: columns
             })
          });
     })
   }
   displayAreas(sodaC);
};
