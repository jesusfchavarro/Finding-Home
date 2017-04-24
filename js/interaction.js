$(".main-menu > ul > li > a")
   .click(function() {
      $(this)
         .parent()
         .children("div.menu")
         .animate({
            height: "toggle"
         }, 500)
   });

$(".main-menu > ul > li > a")
   .click();

$(".click-me")
   .click(function() {
      s = this.getAttribute("data-chart");
      $(this)
         .parent()
         .parent()
         .children("form." + s)
         .animate({
            height: "toggle"
         }, 500)
   });

$(".click-me")
   .click();

$("select.ui")
   .change(function() {
      var d = this.getAttribute("data-chart");
      switch (d) {
         case "tmp":
            tmpChart.transform(this.value.split(" ")[0].toLowerCase(), ["Minimum temperature", "Maximum temperature", "Average temperature"])
            break;
         case "wind":
            tmpChart.transform(this.value.split(" ")[0].toLowerCase(), "Average wind speed")
            break;
         case "prcp":
            prcpChart.update({
               chart: {
                  type: this.value.split(" ")[0].toLowerCase()
               }
            })
            break;
         default:

      }

   });

$("input.layer-menu")
   .change(function() {
      var s = this.getAttribute("data-layer");
      $("." + s)
         .toggleClass("none");
   })

$("input[type=\"range\"]")
   .on('input', function() {
      $(this)
         .parent()
         .find("span")
         .text(this.value);

   })

$("#lock")
   .change(function() {
      $("nav")
         .toggleClass("expanded")
   })

$("#max-distance")
   .on('input', function() {
      var s = this.value*1000;
      for (var i = houseMarkers.length-1; i > -1; i--) {
        if(houseMarkers[i].distance < s){
          $(houseMarkers[i].html).removeClass("none");
        }else{
          $(houseMarkers[i].html).addClass("none")
        }
      }
   })

$("#range-crime")
   .on('input', function() {
     changeLayer(this.value);
      var s = this.value;

      var d = $('input[name=community1]')
         .val();
      if (d == "") {
         d = []
         for (var i = 1; i < 15; i++) {
            d.push([data[i].name, crimeStops[s][i].count])
         }
      } else {
         d = d.split(",")
            .map(function(number) {
               return [data[number].name, crimeStops[s][number].count];
            })
      }

      charts["crimeRatePie"] = c3.generate({
         bindto: '#crimeRatePie',
         data: {
            columns: d,
            type: $("input[name=chartType]:checked")[0].value,
         },
         legend: {
            hide: true
         }
      })
   })

$('input[name=community1]')
   .change(function() {
      var d = $(this)
         .val()
         .split(",")
         .map(function(number) {
            return [data[number].name, data[number].crimes]
         })
      charts["crimeRatePie"] = c3.generate({
         bindto: '#crimeRatePie',
         data: {
            columns: d,
            type: $("input[name=chartType]:checked")[0].value,
         },
         legend: {
            hide: true
         }
      })
   })

$('input[name=chartType]')
   .change(function() {
      charts["crimeRatePie"].transform(this.value)
   })
