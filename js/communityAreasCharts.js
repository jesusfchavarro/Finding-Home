var charts = {},
   data = {},
   datasets = {};
(function(soda) {
   $('.dropdown').dropdown();

   datasets["community_areas"] = soda.query()
      .withDataset('igwz-8jzy')

   datasets.community_areas.select("community as name,area_numbe as number")
      .order("number")
      .getRows()
      .on("success", function(d) {
         console.log(d);
         for (var i = 0; i < d.length; i++) {
            data[d[i].number] = d[i];
            $('div.community1>.menu')
               .append("<div class='item' data-value=" + d[i].number + ">" +
                  d[i].name + '</div>')
         }
         data[0] = {}
         console.log(data);
         data = Object.keys(data).map(function (key) { return data[key]; });
         console.log(data);
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
               if(!data[d[i].number]){
                 data[d[i].number] = {};
               }
               data[d[i].number].crimes = d[i].count;
            }
            charts["crimeRatePie"] = c3.generate({
              bindto: '#crimeRatePie',
               data: {
                  columns: data.map(function(d){
                    return [d.name, d.crimes]
                  }).slice(0,15),
                  type: 'pie',
               },legend: {
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




})(new soda.Consumer('data.cityofchicago.org'));
