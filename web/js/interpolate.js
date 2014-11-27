function Interpolate(vehicleID, map_this, onInterpolate) {
    
    var THIS = this;
    THIS.MAP_THIS = map_this;
    THIS.id = vehicleID;
    
    //mph
    THIS.speed = 20;
    THIS.cur_x = null;
    THIS.cur_x = null;
    THIS.new_x = null;
    THIS.new_y = null;
    THIS.start_time = null;
    THIS.next_stop_id = null;
    THIS.onInterpolate = onInterpolate;
    
    function display_coordinates() {
        console.log("cur_x: " + THIS.cur_x + ", cur_y: " + THIS.cur_y);
        console.log("new_x: " + THIS.new_x + ", new_y: " + THIS.new_y);
    }

    THIS.interpolate = function(cur_time) {
        //convert speed in mph to fps
        var speed = 20 * (5280 / 3600);
        var interval = cur_time - THIS.start_time;
        var data = {
            "current":{"x":THIS.cur_x, "y":THIS.cur_y},
            "new":{"x":THIS.new_x, "y":THIS.new_y}
        };
        
        var coord = THIS.interpolate_calc(speed, interval ,data);
        THIS.cur_x = coord["x"];
        THIS.cur_y = coord["y"];
        
        if(typeof THIS.onInterpolate == "function") {
            console.log("onInterpolate callback");
            THIS.onInterpolate(THIS);
        }
    }
    
    THIS.project = function(coords) {
        //coords are coordinates in EPSG:4326
        //console.log(coords);
        var new_projection = PROJ[2913];
        var new_coords = proj4(new_projection, coords);
        //console.log(new_coords);
        return new_coords;
    }

    THIS.get_latlng = function() {
        var proj_coords = proj4(
            PROJ[2913], PROJ[4326], {"x":THIS.cur_x, "y":THIS.cur_y});
        return {"lat":proj_coords.y, "lon":proj_coords.x};
    }
   
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

        /*
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
        
        });*/
    }
   
    /*  
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
    
    THIS.interpolate_calc = function(speed, interval, data) {
       
        var cur_x = data["current"]["x"];
        var cur_y = data["current"]["y"];
        var new_x = data["new"]["x"];
        var new_y = data["new"]["y"];
        
        var x_diff = new_x - cur_x;
        var y_diff = new_y - cur_y;
        
        //console.log("interpolate");
        //console.log(speed);
        //console.log(interval);
        //console.log(x_diff);
        //console.log(y_diff);
        
        //total distance from current location
        //to new location
        var total_dist = Math.sqrt(
            Math.pow(x_diff, 2) + 
            Math.pow(y_diff, 2)
        );
       
        //x and y coordinates will be interpolated
        //based on travel speed and distance
        //to new location
        var ratio = interval / (total_dist / speed);
        //console.log(total_dist);
        //console.log(ratio);
        //console.log(x_diff * ratio);
        //console.log(y_diff * ratio);

        var coords = {  
            "x":cur_x + (x_diff * ratio),
            "y":cur_y + (y_diff * ratio)
        };

        //console.log(coords);
        //var coords = proj4(PROJ[2913], PROJ[4326], {
        //    "x":cur_x + (x_diff * ratio),
        //    "y":cur_y + (y_diff * ratio)
        //});
        
        return coords;
    }
    
}
