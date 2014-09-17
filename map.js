function Map(params) {

    var THIS = this;
    
    this.APPID = params.APPID;
    this.BASE_URL = params.BASE_URL;
    this.WS_VEH = params.WS_VEH;
    this.WS_ROUTES = params.WS_ROUTES;
    this.WS_ARRIVALS = params.WS_ARRIVALS;

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

        this.map.on('popupopen', function(e) {
            THIS.map.panTo(e.popup.getLatLng());
            var btn = $($.parseHTML(e.popup.getContent()[2]));
            var btnText = btn.context.outerHTML;
            
            //modify popup to only display button
            //until stop name is recieved from AJAX call
            e.popup.setContent(btnText);

            var url = THIS.BASE_URL + "/" + THIS.WS_ARRIVALS;
            var params = {appID:THIS.APPID, json:true, locIDs:btn.attr("stop")};
            $.getJSON(url, params ,function(data) {
                //TODO handle if more than location.length > 0 ???
                var desc = data.resultSet.location[0].desc;
                e.popup.setContent(desc + "<br>" + btnText);
            });

        });
        
        //create empty layer for vehicle locations
        this.vehicles = new L.featureGroup().addTo(this.map);
    }

    function clearVehicles() {
        THIS.vehicles.clearLayers();
    } 
    
    function buildPopup(feature, layer) {
        var _coord = "coord='" + "{\"lat\":" + 
            layer._latlng.lat + ",\"lon\":" + 
            layer._latlng.lng + "}" + "' "; 
        var _route = "route=\"" + feature.properties.routeNumber + "\" "; 
        var _type = "type=\"button\" ";
        var _style = "style=\"width:100%\" ";
        var _class = "class=\"track-vehicle btn btn-default btn-xs\" ";
        var _next_stop = "stop=\"" + feature.properties.nextLocID + "\" "; 

        var btn = "<button "+  _type + _route + _class +
            _next_stop + _style + _coord + ">Track</button>";
        var popup = L.popup()
            .setContent(feature.properties.signMessage + "<br>" + btn); 
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
              "loadPercentage":data.loadPercentage,
              "nextLocID":data.nextLocID
          }
        };
        return vehicle;
    }

    //create leaflet object and add to vehicles geoJSON layer
    function addVehicle(data) {
        if (THIS.dir == null || THIS.dir == data.direction) {
            var geoJson = new L.geoJson(
                buildVehicleGeoJSON(data), {
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup(buildPopup(feature, layer));
                    }
                }
            );
            THIS.vehicles.addLayer(geoJson);
        }
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

          $.getJSON(url, params ,function(data) {
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








