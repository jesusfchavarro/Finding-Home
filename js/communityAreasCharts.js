var charts = {},
   data = {},
   datasets = {};
(function(soda) {
   $('.dropdown')
      .dropdown();

   datasets["community_areas"] = soda.query()
      .withDataset('igwz-8jzy')

   datasets.community_areas.select("community as name,area_numbe as number")
      .order("number")
      .getRows()
      .on("success", function(d) {
         for (var i = 0; i < d.length; i++) {
            data[d[i].number] = d[i];
            $('div.community1>.menu')
               .append("<div class='item' data-value=" + d[i].number + ">" +
                  d[i].name + '</div>')
         }
         data[0] = {}
         data = Object.keys(data)
            .map(function(key) {
               return data[key];
            });
      })
      .on('error', function(error) {
         console.log("Some data can't load, please refresh the page");
         console.error(error);
      });

   datasets["crimes"] = soda.query()
      .withDataset('6zsd-86xi')

   datasets["crimes"].select("community_area as number,count(*)")
      .where("number IS NOT NULL")
      .group("number")
      .getRows()
      .on("success", function(d) {
         for (var i = 0; i < d.length; i++) {
            if (!data[d[i].number]) {
               data[d[i].number] = {};
            }
            data[d[i].number].crimes = d[i].count;
         }
         charts["crimeRatePie"] = c3.generate({
            bindto: '#crimeRatePie',
            data: {
               columns: data.map(function(d) {
                     return [d.name, d.crimes]
                  })
                  .slice(0, 15),
               type: 'pie',
            },
            legend: {
               hide: true

            }
         })
      })
      .on('error', function(error) {
         console.log("Some data can't load, please refresh the page");
         console.error(error);
      });

   /*   soda.query()
      .withDataset()
      .select(":@computed_region_vrxf_vc4k, count(*)")
      .where(":@computed_region_vrxf_vc4k is not null")
      .group(":@computed_region_vrxf_vc4k")
      .getRows()
      .on('success',function() {

      })
      .on('error', function(){

      })*/


   var select = drag.features.map(function(curr, i) {
      var coord = curr.geometry.coordinates
      return "sum(case(within_circle(location," + coord[1] + "," + coord[0] +
         ",1000),1,true,0)) as loupe" + i
   });

   var select = select.join(",");

   datasets["polices_stations"] = soda.query()
      .withDataset('9rg7-mz9y');
   datasets["fire_stations"] = soda.query()
      .withDataset('b4bk-rjxe');
   datasets["Affordable_rental_houses"] = soda.query()
      .withDataset('uahe-iimk');
   datasets["public_health_clinic"] = soda.query()
      .withDataset('t57k-za2y');
   $.when(
         $.ajax(datasets["Affordable_rental_houses"].select(select)
            .getURL()),
         $.ajax(datasets["polices_stations"].select(select)
            .getURL()),
         $.ajax(datasets["fire_stations"].select(select)
            .getURL()),
         $.ajax(datasets["public_health_clinic"].select(select)
            .getURL())
      )
      .done(function(v1, v2, v3) {
         var columns = [
            ['x', "Affordable rental houses", 'Police Stations', 'Fire Stations', 'Public Health Clinics']
         ];
         for (var i = 1; i <= drag.features.length; i++) {
            columns.push(["Loupe " + i])
         }
         for (var i = 0; i < arguments.length; i++) {
            for (var l in arguments[i][0][0]) {
               var j = parseInt(l.charAt(l.length - 1)) + 1;
               columns[j].push(arguments[i][0][0][l])
            }
         }

         charts["buildingChart"] = c3.generate({
            bindto: '#buildingChart',
            size: {
               width: 420,
               height: 300
            },
            data: {
               x: 'x',
               columns: columns,
               type: 'bar'
            },
            axis: {
               x: {
                  type: 'category',
                  tick: {
                     rotate: 0,
                     multiline: true
                  },
                  height: 50
               },
               y: {
                  max: 20
               }
            }
         });
      });


      var within = function(name,lat, long, radius){
        return "within_circle("+ name + "," + lat +"," + long + "," + radius + ")";
      };

      var ca = [];
      var wh = []
      var co = [];
var loupesColors = ["Blue", "Orange", "Green"];
      for (var i = 0; i < drag.features.length; i++) {
        co = drag.features[i].geometry.coordinates;
        var tmp = within("the_geom",co[1], co[0], 1500);
        ca.push(tmp + "," + i);
        wh.push(tmp);
      }
      ca = ca.join(",");
      wh = wh.join(" OR ");

      soda.query()
         .withDataset('eix4-gf83')
         .select("facility_n as Name, CASE(" + ca + /*",true,-1*/") as loupe, count(*)")
         .group("facility_n, loupe")
         .where(wh)
         .order("loupe")
         .limit(5000)
         .getRows()
         .on('success', function(data){

           data = data.map(function(curr){
             return {Name:curr.Name, loupe:loupesColors[curr.loupe],count:+curr.count}
           });


             charts["treeMap"] = d3plus.viz()
                 .container("#treeMap1")
                 .data(data)
                 .type("tree_map")
                 .id(["loupe","Name"])
                 .size("count")
                 .height(400)
                 .width(400)
                 .draw()


         });

})(new soda.Consumer('data.cityofchicago.org'));
