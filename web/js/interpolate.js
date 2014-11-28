function Interpolate(map_this, build_options) {
    
    var THIS = this;
    THIS.MAP_THIS = map_this;
    //THIS.id = vehicleID;
    
    THIS.speed = 19; //19 fps == 13 mph
    THIS.id = null;
    THIS.x = null;
    THIS.y = null;
    THIS.dest_x = null;
    THIS.dest_y = null;

    THIS.interpolating = false;
    THIS.interpolater = null;
 
    THIS.build_options = build_options;

    /*    
    function display_coordinates() {
        console.log("cur_x: " + THIS.cur_x + ", cur_y: " + THIS.cur_y);
        console.log("new_x: " + THIS.new_x + ", new_y: " + THIS.new_y);
    }
    */
    
    THIS.project = function(coords) {
        //coords are coordinates in EPSG:4326
        var new_projection = PROJ[2913];
        var new_coords = proj4(new_projection, coords);
        return new_coords;
    }

    /*
    THIS.get_latlng = function() {
        var proj_coords = proj4(
            PROJ[2913], PROJ[4326], {"x":THIS.cur_x, "y":THIS.cur_y});
        return {"lat":proj_coords.y, "lon":proj_coords.x};
    }
    */

    THIS.draw = function() {
        var geoJson = THIS.MAP_THIS.vehicleMarkers[THIS.id].toGeoJSON();
        var new_coord = proj4(PROJ[2913], PROJ[4326], {"x":THIS.x, "y":THIS.y});
            
        geoJson.features[0].geometry.coordinates = [new_coord.x, new_coord.y];

        var newGeoJson = L.geoJson(geoJson, THIS.build_options());
        //clearVehicles();
        THIS.MAP_THIS.vehicles.addLayer(newGeoJson);
        //THIS.MAP_THIS.map.panTo([THIS.lat, THIS.lon]);
        //THIS.MAP_THIS.vehicleMarkers[THIS.id] = newGeoJson;
    } 
    
    THIS.reset = function() {
        THIS.x = null;
        THIS.y = null;
        THIS.dest_x = null;
        THIS.dest_y = null;
        clearInterval(THIS.interpolater);
        THIS.interpolater = null;
        THIS.interpolating = false;
    }

    THIS.interpolate = function(cur, next, speed) {
        var ret_val = {};

        var x_diff = Math.abs(next.x - cur.x);
        var y_diff = Math.abs(next.y - cur.y);
        var angle = Math.atan(y_diff / x_diff);

        var x = Math.cos(angle) * speed;
        var y = Math.sin(angle) * speed;

        if (next.y - cur.y < 0) y = y * -1.0;
        if (next.x - cur.x < 0) x = x * -1.0;

        ret_val["x"] = x;
        ret_val["y"] = y;

        return ret_val;
    }
 

    THIS.start = function(lat, lon, next_stop, vehicleID) {
        THIS.id = vehicleID;

        var current = THIS.project({"x":lon, "y":lat});
        THIS.x = current.x;
        THIS.y = current.y;
        console.log(current);        
        
        var params = {"stop_id":next_stop};
        var url = "http://meyersj.com/api/stop_lookup";
      
        //initalize new stop coordinates and name 
        $.getJSON(url, params, function(data) {
            var resp = data.response;
            THIS.dest_x = resp.coord.x;
            THIS.dest_y = resp.coord.y;
            var stop_name = resp.coord.stop_name;
       
            //start interpolation 
            THIS.interpolater = setInterval(function() {
                var diff = THIS.interpolate(
                    {"x":THIS.x, "y":THIS.y},
                    {"x":THIS.dest_x, "y":THIS.dest_y},
                    THIS.speed
                );
                THIS.x = THIS.x + diff.x;
                THIS.y = THIS.y + diff.y;
                console.log(THIS.x);
                console.log(THIS.y);
                THIS.draw();
            }, 1000);

            THIS.interpolating = true;
        }); 
    }
}   

/*
    THIS.start = function(next_stop_loc, current_coordinates) {
        THIS.start_time = (new Date).getTime() / 1000;
        current_coordinates = proj4(PROJ[4326], PROJ[2913], current_coordinates);
        THIS.cur_x = current_coordinates["x"];
        THIS.cur_y = current_coordinates["y"];
        var params = {"stop_id":next_stop_loc};
        var url = "http://192.241.235.16/api/stop_lookup";
      
        //initalize new stop coordinates and name 
        $.getJSON(url, params, function(data) {
            var resp = data.response;
            THIS.new_x = resp.coord.x;
            THIS.new_y = resp.coord.y;
            THIS.stop_name = resp.coord.stop_name;
        
            THIS.interpolate_interval = setInterval(function() {
                THIS.interpolate((new Date).getTime() / 1000);
            }, 1000);
        }); 

        $.getJSON(url, params, function(data) {
            var resp = data.response;
            THIS.new_x = resp.coord.x;
            THIS.new_y = resp.coord.y;
            
            //display_coordinates();

            THIS.stop_name = resp.coord.stop_name;
            //console.log(resp);  

            THIS.tracking = setInterval(function() {
                THIS.interpolate((new Date).getTime() / 1000);
                //console.log("interpolate");
            }, 5000);
        
        });
    }


    THIS.interpolate = function(current_coordinates, next_stop_id) {
        var cur_x = current_coordinates["x"];
        var cur_y= current_coordinates["y"];
        
        var params = {"stop_id":next_stop_id};
        var url = "//192.241.235.16/api/stop_lookup";
            
            //?stop_id=8343 
        $.getJSON(THIS.URL + "/stop_lookup", params, function(data) {
            var resp = data.response;
            console.log(resp);  
        });
    }
*/
