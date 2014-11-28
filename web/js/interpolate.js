function Interpolate(map) {
    
    var THIS = this;
    THIS.MAP = map;
    THIS.id = null;
    THIS.speed = 19; //19 fps == 13 mph
    THIS.id = null;
    THIS.x = null;
    THIS.y = null;
    THIS.dest_x = null;
    THIS.dest_y = null;
    THIS.interpolating = false;
    THIS.interpolater = null;
   

    THIS.getCoord = function(x, y) {
        return {"x":x, "y":y};
    }

    THIS.project = function(coords) {
        //coords are coordinates in EPSG:4326
        var new_projection = PROJ[2913];
        var new_coords = proj4(new_projection, coords);
        return new_coords;
    }

    THIS.draw = function(x, y) {
        var coord = proj4(PROJ[2913], PROJ[4326], THIS.getCoord(x,y));
        THIS.MAP.mapUtils.moveVehicle(THIS.id, coord.y, coord.x);
        //save coordinates
        THIS.x = x;
        THIS.y = y;
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

    /* interpolate new vehicle location in one second
     * based on current location, next stop and speed estimate
     */
    THIS.interpolate = function(cur, next, speed) {
        var x_diff = Math.abs(next.x - cur.x);
        var y_diff = Math.abs(next.y - cur.y);
        var angle = Math.atan(y_diff / x_diff);
        var x = Math.cos(angle) * speed;
        var y = Math.sin(angle) * speed;
        if (next.y - cur.y < 0) y = y * -1.0;
        if (next.x - cur.x < 0) x = x * -1.0;
        return THIS.getCoord(x, y);
    }
 

    THIS.start = function(lat, lon, next_stop, vehicleID) {
        THIS.id = vehicleID;

        var current = THIS.project(THIS.getCoord(lon, lat));
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
                //calculate difference for new estimate
                //from current location
                var diff = THIS.interpolate(
                    THIS.getCoord(THIS.x, THIS.y),
                    THIS.getCoord(THIS.dest_x, THIS.dest_y),
                    THIS.speed
                );
                THIS.draw(THIS.x + diff.x, THIS.y + diff.y);
            }, 1000);

            THIS.interpolating = true;
        }); 
    }
}   
