var filterControls =  
    '<div>' +
        '<div class="btn-group" role="form" style="margin-bottom:5px">' +
            '<button id="line-btn" type="button"' +
                'class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown">' +
            'Route    <span class="caret"></span>' +
            '</button>' +
            '<ul id="filter-line" class="dropdown-menu pull-right scrollable-menu"' +
                'role="menu">' +
                '<li role="presentation" class="dropdown-header">Route</li>' +
                '<li role="presentation"><a href="#">All</a></li>' +
                '<li role="presentation" class="divider"></li>' +
            '</ul>' +
        '</div>' +
        '<br>' + 
        '<div class="btn-group" id="dir-group">' + 
            '<button id="dir-btn" type="button"' +
                'class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown">' +
                'Direction    <span class="caret"></span>' +
            '</button>' +
            '<ul id="filter-dir" class="dropdown-menu pull-right scrollable-menu"' + 
                'role="menu">' +
                '<li role="presentation" class="dropdown-header">Direction</li>' +
                '<li role="presentation"><a href="#">All</a></li>' +
                '<li role="presentation" class="divider"></li>' +
                '<li class="dir-option"><a href="#">Inbound</a></li>' +
                '<li class="dir-option"><a href="#">Outbound</a></li>' +
            '</ul>' +
        '</div>' +
    '</div>';

var markerOptions = {
     radius: 8,
     color: "#000",
     weight: 1,
     opacity: 1,
     fillOpacity: 0.8,
     fillColor: '#D69020'
};



function Map(params) {

    var THIS = this;
    
    this.APPID = params.APPID;
    this.BASE_URL = params.BASE_URL;
    this.WS_VEH = this.BASE_URL + "/" + params.WS_VEH;
    this.WS_ROUTES = this.BASE_URL + "/" + params.WS_ROUTES;
    this.WS_ARRIVALS = this.BASE_URL + "/" + params.WS_ARRIVALS;

    this.mapDiv = params.map_div;
    this.map = null;
    this.vehicles = null;
    this.rte = null;
    this.dir = null; 
    this.vehicleMarkers = {};
    this.tracking = null;
    this.currentVehicle = null;

    this.initmap = function() {
        // set up the map
        this.map = new L.Map(this.mapDiv);
        
        // create the tile layer with correct attribution
        //var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osmUrl = 'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png';
        var id = "meyersj.map-6u6rh54c";
        
        var osmAttrib = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
        var osm = new L.TileLayer(osmUrl, {
            minZoom: 1,
            maxZoom: 20,
            attribution: osmAttrib,
            id: id
        });
        
        // start the map in South-East England
        this.map.setView(new L.LatLng(45.51, -122.678),12);
        this.map.addLayer(osm);

        this.map.on('popupopen', function(e) {
            THIS.map.panTo(e.popup.getLatLng());
            var btn = $($.parseHTML(e.popup.getContent())[2]);
            var btnText = btn.context.outerHTML;
            
            //modify popup to only display button
            //until stop name is recieved from AJAX call
            e.popup.setContent(btnText);

            var params = {appID:THIS.APPID, json:true, locIDs:btn.attr("stop")};
            $.getJSON(THIS.WS_ARRIVALS, params ,function(data) {
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
        THIS.vehicleMarkers = {};
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
        var _vehID = "veh-id=\"" + feature.properties.vehicleID + "\" ";

        var btn = "<button "+  _type + _route + _class + _vehID + 
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
              "nextLocID":data.nextLocID,
              "vehicleID":data.vehicleID
          }
        };
        return vehicle;
    }


    function buildGeoJsonOptions() {
        var options = {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, markerOptions);
            },
            
            onEachFeature: function (feature, layer) {
                layer.bindPopup(buildPopup(feature, layer));
            }
        }
        return options;
    }

    //create leaflet object and add to vehicles geoJSON layer
    function addVehicle(data) {
        if (THIS.dir == null || THIS.dir == data.direction) {
            var geoJson = new L.geoJson(
                buildVehicleGeoJSON(data), buildGeoJsonOptions()
            );
            THIS.vehicleMarkers[data.vehicleID] = geoJson;           
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
        var params = {appID:this.APPID};

        if(this.rte !== null) {
          params["routes"] = this.rte;
        }

        $.getJSON(THIS.WS_VEH, params ,function(data) {
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

    var onInterpolate = function() {
        var MAP_THIS = this.MAP_THIS;
        //console.log(this.cur_x);
        //console.log(this.cur_y);
        var latlng = proj4(PROJ[2913], PROJ[4326],
            {"x":this.cur_x, "y":this.cur_y}); 
        
        var geoJson = MAP_THIS.vehicleMarkers[this.id].toGeoJSON();
        geoJson.features[0].geometry.coordinates = [
            latlng["x"], latlng["y"]
        ];
        clearVehicles();
        var newGeoJson = L.geoJson(geoJson, buildGeoJsonOptions());
        MAP_THIS.vehicles.addLayer(newGeoJson);
        MAP_THIS.vehicleMarkers[this.id] = newGeoJson;
    }
    
    function VehicleStatus(vehicleID, map, url, appID) {
        var THIS = this;
        var MAP_THIS = map;
        THIS.id = vehicleID;
        THIS.appID = appID;
        THIS.url = url;
        THIS.lat = null;
        THIS.lon = null;
        THIS.next_stop_id = null;
        
        THIS.interpolate = new Interpolate(vehicleID, MAP_THIS, onInterpolate);

        function build_params(id) {
            return {appID:THIS.appID, ids:THIS.id};
        } 
        
        THIS.get_coord = function() {
            return {"x":THIS.lon, "y":THIS.lat}; 
        }

        THIS.get_latlon = function() {
            return {"lon":THIS.lon, "lat":THIS.lat}; 
        }

        function same(new_lat, new_lon) {
            if(THIS.lat == new_lat && THIS.lon == new_lon)
                return true;
            return false;
        }

        THIS.update = function() {
            var params = build_params();
            
            $.getJSON(THIS.url, params ,function(data) {
                console.log(data);
                //var layer = MAP_THIS.vehicleMarkers[id];
                var new_lat = data.resultSet.vehicle[0].latitude;
                var new_lon = data.resultSet.vehicle[0].longitude;
                var next_stop_id = data.resultSet.vehicle[0].nextLocID;
                console.log(next_stop_id);
 
                //update map and reset interpolation?
                if(!same(new_lat, new_lon)) {
                    //console.log("new coordinates");
                    THIS.lat = new_lat;
                    THIS.lon = new_lon; 
                    
                    THIS.interpolate.start(next_stop_id, THIS.get_coord());

                    //update vehicle on map
                    var geoJson = MAP_THIS.vehicleMarkers[THIS.id].toGeoJSON();
                    geoJson.features[0].geometry.coordinates = [THIS.lon, THIS.lat];
                    var newGeoJson = L.geoJson(geoJson, buildGeoJsonOptions());
                    clearVehicles();
                    MAP_THIS.vehicles.addLayer(newGeoJson);
                    MAP_THIS.map.panTo([THIS.lat, THIS.lon]);
                    MAP_THIS.vehicleMarkers[THIS.id] = newGeoJson;
                }
                //do nothing
                //we should be interpolating
                else {
                    //console.log("same coordinates");
                }
                 
            });
        }
    }


    THIS.trackVehicle = function(vehicleID) {
        //no vehicle has been tracked yet
        if(THIS.currentVehicle == null || THIS.currentVehicle.id != vehicleID) {
            THIS.currentVehicle = new VehicleStatus(
                vehicleID, THIS, THIS.WS_VEH, THIS.APPID);
            THIS.tracking = vehicleID;
        }
        
        //same vehicle keep check for updates
        var tracking = setInterval(function() {
            THIS.currentVehicle.update();
        }, 5000);
    }

}







