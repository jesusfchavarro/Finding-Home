mapboxgl.accessToken = 'pk.eyJ1IjoiamVzdXNmY2hhdmFycm8iLCJhIjoiY2owd3JhNTg5MDAyMDMzc2Q5djhheHhleiJ9.gbHmrqcN3ktZBZYQmGNVIg';

var center = [-87.6505, 41.8708];
var dataSets = {};
var profile = "walking";
function HelloWorldControl() {}
HelloWorldControl.prototype.onAdd = function(map) {
   this._map = map;
   var button = $("<div class=\"mapboxgl-ctrl mapboxgl-ctrl-group\">" +
      "<button class=\"mapboxgl-ctrl-icon mapboxgl-ctrl-layer\" type=\"button\">" +
      "<span class=\"flaticon-layers fa-1x \"></span>" +
      "</div>");
   var layerMenu = $("<div id=\"layer-menu\" class=\"mapboxgl-ctrl mapboxgl-ctrl-group\">" +
      "<input name=\"layer\" id=\"basic\" type=\"radio\" value=\"basic\">" +
      "<label for=\"basic\">basic</label><br>" +
      "<input name=\"layer\" id=\"streets\" type=\"radio\" value=\"streets\"  checked=\"checked\">" +
      "<label for=\"streets\">streets</label><br>" +
      "<input name=\"layer\" id=\"bright\" type=\"radio\" value=\"bright\">" +
      "<label for=\"bright\">bright</label><br>" +
      "<input name=\"layer\" id=\"light\" type=\"radio\" value=\"light\">" +
      "<label for=\"light\">light</label><br>" +
      "<input name=\"layer\" id=\"dark\" type=\"radio\" value=\"dark\">" +
      "<label for=\"dark\">dark</label><br>" +
      "<input name=\"layer\" id=\"satellite\" type=\"radio\" value=\"satellite\">" +
      "<label for=\"satellite\">satellite</label>" +
      "</div>");

   var a = button.children().click(function() {
      layerMenu.animate({
         opacity: "toggle",
         height: "toggle"
      }, 1000);
   });
   layerMenu.children("input").click(function() {
      map.setStyle('mapbox://styles/mapbox/' + this.id + '-v9');
   });


   button.children().click();
   this._container = button[0];
   this._container.appendChild(layerMenu[0])
   return this._container;
};

HelloWorldControl.prototype.onRemove = function() {
   this._container.parentNode.removeChild(this._container);
   this._map = undefined;
};



var map = new mapboxgl.Map({
   container: 'map',
   style: 'mapbox://styles/mapbox/streets-v9',
   zoom: 12,
   center: center
});

map.addControl(new mapboxgl.NavigationControl());
map.addControl(new HelloWorldControl());



var popup = new mapboxgl.Popup({
      offset: 25
   })
   .setText('Department of Computer Science – University of Illinois, Chicago');

var flag = document.createElement('div');
flag.id = "UIC-flag"

new mapboxgl.Marker(flag, {
      offset: [-25, -25]
   })
   .setLngLat(center)
   .setPopup(popup) // sets a popup on this marker
   .addTo(map);
