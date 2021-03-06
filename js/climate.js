Date.prototype.format = function() {
   var month = this.getMonth();
   month = (month < 10 ? "0" : "") + (month + 1);
   var day = this.getDate();
   day = (day < 10 ? "0" : "") + day;
   return this.getFullYear() + "-" + month + "-" + day
}
var token = "frheMcmaRJDAggOCZCgViSrHykkVWcVQ";
var tmpChart, prcpChart;
// use with Array.prototype.map()
function avg(o) {
   if (typeof o == "string") {
      return o;
   }
   return d3.mean(o) || 0;
}
// use with Array.prototype.reduce()
function sum(acc, v, i) {
   if (isNaN(v)) {
      return acc;
   }
   return acc + v;
}
(function getWeather() {
   var endDate, startDate;
   var locationid = "CITY:US170006";
   // get information of the dataset, like the date of the last register
   $.ajax({
         url: "https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets/GHCND",
         data: {
            locationid: locationid
         },
         headers: {
            token: token
         }
      })
      .done(function(d) {
         maxdate = d.maxdate.split("-");
         endDate = new Date(maxdate[0], maxdate[1] - 1, maxdate[2]);
         startDate = new Date(endDate - (24000 * 3600 * 10));
      })
      .fail(function() {
         console.log("Error charging data of https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets/GHCND")
         endDate = new Date();
         startDate = new Date(endDate - (24000 * 3600 * 7))
      })
      .always(function() {
         //with the dates a get the register of the last seven days
         $.when(
               $.ajax({
                  url: "https://www.ncdc.noaa.gov/cdo-web/api/v2/data/?datatypeid=PRCP&datatypeid=TMAX&datatypeid=TMIN&datatypeid=AWND&datatypeid=SNOW",
                  data: {
                     locationid: locationid,
                     datasetid: "GHCND",
                     startdate: startDate.format(),
                     enddate: endDate.format(),
                     limit: 1000,
                     sortfield: "date",
                     units: "metric"
                  },
                  headers: {
                     token: token
                  }
               }),
               $.ajax({
                  url: "https://www.ncdc.noaa.gov/cdo-web/api/v2/data/?datatypeid=PRCP&datatypeid=TMAX&datatypeid=TMIN&datatypeid=AWND&datatypeid=SNOW",
                  data: {
                     locationid: locationid,
                     datasetid: "GHCND",
                     startdate: startDate.format(),
                     enddate: endDate.format(),
                     limit: 1000,
                     sortfield: "date",
                     units: "metric",
                     offset: 1001
                  },
                  headers: {
                     token: token
                  }
               }),
               $.ajax({
                  url: "https://www.ncdc.noaa.gov/cdo-web/api/v2/data/?datatypeid=PRCP&datatypeid=TMAX&datatypeid=TMIN&datatypeid=AWND&datatypeid=SNOW",
                  data: {
                     locationid: locationid,
                     datasetid: "GHCND",
                     startdate: startDate.format(),
                     enddate: endDate.format(),
                     limit: 1000,
                     sortfield: "date",
                     units: "metric",
                     offset: 2001
                  },
                  headers: {
                     token: token
                  }
               })
            )
            .done(function(d1, d2, d3) {
               if (d2 && d2[0] && d2[0].results) d1[0].results.push.apply(d1[0].results, d2[0].results);
               if (d3 && d3[0] && d3[0].results) d1[0].results.push.apply(d1[0].results, d3[0].results);
               var TMIN = ["Minimum temperature"],
                  TMAX = ["Maximum temperature"],
                  AWND = ["Average wind speed"],
                  PRCP = ["Rain precipitation"],
                  SNOW = ["Snow precipitation"],
                  XCategory = ["X"],
                  results = d1[0].results
               i = 0,
                  j = 1;
               while (i < results.length) {
                  var o = results[i];
                  var date = o.date;
                  TMIN[j] = [];
                  TMAX[j] = [];
                  PRCP[j] = [];
                  AWND[j] = [];
                  SNOW[j] = [];
                  XCategory[j] = date.slice(0, 10);
                  do {
                     switch (o.datatype) {
                        case "PRCP":
                           PRCP[j].push(o.value);
                           break;
                        case "SNOW":
                           SNOW[j].push(o.value);
                           break;
                        case "TMAX":
                           TMAX[j].push(o.value);
                           break;
                        case "TMIN":
                           TMIN[j].push(o.value);
                           break;
                        case "AWND":
                           AWND[j].push(o.value);
                           break;
                        default:
                     };
                     i += 1;
                     o = results[i];
                  } while (o && date == o.date);
                  j += 1;
               };
               TMIN = TMIN.map(avg);
               TMAX = TMAX.map(avg);
               TAVG = ["Average temperature"];
               for (i = 1; i < TMIN.length; i++) {
                  TAVG.push((TMIN[i] + TMAX[i]) / 2);
               }
               PRCP = PRCP.map(avg);
               SNOW = SNOW.map(avg);
               AWND = AWND.map(avg);
               tmpChart = c3.generate({
                  bindto: '#tmpChart',
                  size: {
                     width: 420,
                     height: 300
                  },
                  data: {
                     x: 'X',
                     columns: [
                        XCategory,
                        TMIN,
                        TMAX,
                        TAVG,
                        AWND
                     ],
                     colors: {
                        "Minimum temperature": '#0e91b2',
                        "Maximum temperature": '#cc1e1e',
                        "Average temperature": "#4d7c26",
                        "Average wind speed": "rgba(119, 119, 119, 0.7)"
                     },
                     types: {
                        "Average wind speed": "bar"
                     },
                     axes: {
                        "Minimum temperature": 'y',
                        "Maximum temperature": 'y',
                        "Average temperature": "y",
                        "Average wind speed": "y2"
                     }
                  },
                  zoom: {
                     enabled: true
                  },
                  legend: {
                     //  position: 'inset'
                  },
                  axis: {
                     x: {
                        type: 'timeseries',
                        tick: {
                           rotate: 35,
                           format: '%Y-%m-%d',
                           //outer: true,
                           centered: true
                        }
                     },
                     y: {
                        label: {
                           text: 'Temperature C°',
                           position: 'outer-middle'
                        }
                     },
                     y2: {
                        show: true,
                        label: {
                           text: 'Wind speed Km/h',
                           position: 'outer-middle'
                        }
                     }
                  },
                  tooltip: {
                     format: {
                        value: function(value, ratio, id) {
                           return value.toFixed(2) + (id == "Average wind speed" ? " m/s" : " C°");
                        }
                     }
                  }
               });

               var charttermo = new FusionCharts({
                     type: 'thermometer',
                     renderAt: 'thermometer',
                     id: 'temp-monitor',
                     width: '140',
                     height: '300',
                     dataFormat: 'json',
                     dataSource: {
                        "chart": {
                           "caption": "Minimum Termperature",
                           "subcaptionFontBold": "0",
                           "lowerLimit": "-20",
                           "upperLimit": "50",
                           "numberSuffix": "°C",
                           "bgColor": "#ffffff",
                           "showBorder": "0",
                           "thmFillColor": "#008ee4"
                        },
                        "value": TMIN[TMIN.length - 1]
                     }
                  })
                  .render();
               charttermo = new FusionCharts({
                     type: 'thermometer',
                     renderAt: 'thermometer2',
                     id: 'temp-monitor2',
                     width: '140',
                     height: '300',
                     dataFormat: 'json',
                     dataSource: {
                        "chart": {
                           "caption": "Avarage Termperature",
                           "subcaptionFontBold": "0",
                           "lowerLimit": "-20",
                           "upperLimit": "50",
                           "numberSuffix": "°C",
                           "bgColor": "#ffffff",
                           "showBorder": "0",
                           "thmFillColor": "#00e462"
                        },
                        "value": TAVG[TAVG.length - 1]
                     }
                  })
                  .render();

               charttermo = new FusionCharts({
                     type: 'thermometer',
                     renderAt: 'thermometer3',
                     id: 'temp-monitor3',
                     width: '140',
                     height: '300',
                     dataFormat: 'json',
                     dataSource: {
                        "chart": {
                           "caption": "Max Termperature",
                           "subcaptionFontBold": "0",
                           "lowerLimit": "-20",
                           "upperLimit": "50",
                           "numberSuffix": "°C",
                           "bgColor": "#ffffff",
                           "showBorder": "0",
                           "thmFillColor": "#e43c00"
                        },
                        "value": TMAX[TMAX.length - 1]
                     }
                  })
                  .render();

               prcpChart = Highcharts.chart('prcpChart', {
                  chart: {
                     type: 'area',
                     zoomType: 'x',
                     width: 420
                  },
                  title: {
                     text: 'Snow and rain presipitation'
                  },
                  subtitle: {
                     text: 'Click and drag in the plot area to zoom in'

                  },
                  xAxis: {
                     categories: XCategory.slice(1)
                  },
                  yAxis: {
                     title: {
                        text: 'Presipitation (mm)'
                     }
                  },
                  tooltip: {
                     pointFormat: '{series.name}: <b>{point.y:,.2f}</b><br/>'
                  },
                  series: [{
                     name: PRCP[0],
                     data: PRCP.slice(1)
                  }, {
                     name: SNOW[0],
                     data: SNOW.slice(1)
                  }]
               });

            });
      });
   /*
      var today = new Date();
      $.ajax({
            url: "http://plenar.io/v1/api/weather/metar/?wban_code=94846&datetime__ge=" + new Date(today - (24000 * 3600 * 5))
               .format() + "&datetime__le=" + today.format(),
         })
         .done(function(d) {
            if (d.meta.total > 0) {
               var temperature = (d.objects[0].observations[0].temp_fahrenheit - 32) * 5 / 9
               var charttermo = new FusionCharts({
                     type: 'thermometer',
                     renderAt: 'thermometer',
                     id: 'temp-monitor',
                     width: '120',
                     height: '300',
                     dataFormat: 'json',
                     dataSource: {
                        "chart": {
                           "caption": "Termperature",
                           "subcaptionFontBold": "0",
                           "lowerLimit": "-20",
                           "upperLimit": "50",
                           "numberSuffix": "°C",
                           "bgColor": "#ffffff",
                           "showBorder": "0",
                           "thmFillColor": "#008ee4"
                        },
                        "value": temperature
                     }
                  })
                  .render();
                  var wheater = "images/"
                  var sky = d.objects[0].observations[0].sky_condition
                  if(sky.indexOf("OVC") >= 0){
                    wheater = "cloud.png";
                  }else if(sky.indexOf("SCT")){
                    wheater += "sun-cloud.png"
                  }else{
                    wheater += "sun.png"
                  }
                  $("#wheater")[0].src = wheater
            }
         })
         .fail(function() {
            console.log("Error charging data of http://http://plenar.io/v1/api/weather")
         })*/
})();
