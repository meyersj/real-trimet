function Map(params) {

    var THIS = this;
    //this.THIS = this;
    this.APPID = params.APPID;
    this.BASE_URL = params.BASE_URL;
    this.WS_VEH = params.WS_VEH;
    this.WS_ROUTES = params.WS_ROUTES;

    this.mapDiv = params.map_div;
    this.map = null;
    this.vehicles = null;
    this.rte = null;
    this.dir = null; 


    this.initmap = function() {
        // set up the map
        this.map = new L.Map(this.mapDiv);
        
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
        
        //create empty layer for vehicle locations
        this.vehicles = new L.featureGroup().addTo(this.map);
    }
 

    function clearVehicles() {
        THIS.vehicles.clearLayers();
    } 

    

    function buildPopup(feature, layer) {
        //var message = feature.properties.signMessage;
        //var route = feature.routeNumber;
      
        //console.log(layer._latlng.lat);
        //map.panTo({lon: 30, lat: 50});
                
        //JSON.parse( [30, 50] );
        var lat = layer._latlng.lat;
        var lon = layer._latlng.lng;
        var coord = "{\"lat\":" + lat + ",\"lon\":" + lon + "}";

        var _coord = "coord='" + coord + "' "; 
        var _route = "route=\"" + feature.properties.routeNumber + "\" "; 
        var _type = "type=\"button\" ";
        var _style = "style=\"width:100%\" ";
        var _class = "class=\"track-vehicle btn btn-default btn-xs\" ";
           
        var btn = "<button "+  _type + _route + _class +
            _style + _coord + ">Track</button>";
        var popup = feature.properties.signMessage + "<br>" + btn; 

        //var load = feature.properties.loadPercentage;
        //return message + " <b>" + load + "</b>";
        return popup;
    }

    //construct geojson for each vehicle returned from TriMet api
    function buildVehicleGeoJSON(data) {
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
        return vehicle;
    }

    //create leaflet object and add to vehicles geoJSON layer
    function addVehicle(data) {
        var t = THIS.dir || "-";
        console.log( t.toString() + data.direction.toString());
        if (THIS.dir == null || THIS.dir == data.direction) {
            console.log("match");

            var geoJson = new L.geoJson(
                buildVehicleGeoJSON(data), {
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup(buildPopup(feature, layer));
                    }
                }
            );
            
            THIS.vehicles.addLayer(geoJson);
        }
        else { console.log("no match");}
    }

    function zoomToVehicles() {
        THIS.map.fitBounds(THIS.vehicles.getBounds().pad(0.05));
    }



    this.zoomToVehicle = function(latlng) {
        THIS.map.setView(latlng, 16);
        THIS.map.closePopup();
    }


    this.setRoute = function(rte) {
        THIS.rte = rte;
    }

    this.setDirection = function(dir) {
        THIS.dir = dir;
    }


    this.updateVehicles = function() {
          var url = this.BASE_URL + "/" + this.WS_VEH;
          var params = {appID:this.APPID};

          if(this.rte !== null) {
              params["routes"] = this.rte;
          }


          console.log(params);
          $.getJSON(url, params ,function(data) {
              console.log(data);
              
              //TODO handle if error was returned from api 
              clearVehicles();
              
              if(data.resultSet.hasOwnProperty('vehicle')) {
                  for(var i = 0; i < data.resultSet.vehicle.length; i++) {
                      addVehicle(data.resultSet.vehicle[i]);
                  }
                  zoomToVehicles();
              }
              else {
                  alert("No vehicle locations available for that route");
              }
          });
      }





}








