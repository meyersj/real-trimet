



function Map() {

    this.map = null;
    this.vehicles = null;

    this.initmap = function(mapDiv) {
        // set up the map
        this.map = new L.Map(mapDiv);

        // create the tile layer with correct attribution
        //var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osmUrl = 'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png';    
        var osmAttrib = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
        var osm = new L.TileLayer(osmUrl, {
            minZoom: 1,
            maxZoom: 20,
            attribution: osmAttrib,
            id: 'examples.map-i86knfo3'
        });       

        // start the map in South-East England
        this.map.setView(new L.LatLng(45.51, -122.678),12);
        this.map.addLayer(osm);
         
        this.vehicles = new L.geoJson().addTo(this.map);
    }

    this.clearVehicles = function() {
        this.vehicles.clearLayers();
    } 

    function buildPopup(feature) {
        var message = feature.properties.signMessage;
        var load = feature.properties.loadPercentage;
        return message + " <b>" + load + "</b>";
    }



    this.addVehicle = function(data) {
        //construct geojson for each vehicle returned from TriMet api
        var vehicle = {
          "type": "Feature",
          "geometry": {
              "type": "Point",
              "coordinates":[
                  data.longitude, data.latitude
              ]
          },
          "properties": {
              "signMessage":data.signMessageLong,
              "routeNumber":data.routeNumber,
              "loadPercentage":data.loadPercentage
          }
        };
        
        //create leaflet object to add to vehicles layer
        var geoJson = L.geoJson(
          vehicle, {
              onEachFeature: function (feature, layer) {
                  layer.bindPopup(buildPopup(feature));
              }
          }
        );
        this.vehicles.addLayer(geoJson);
    }




}














