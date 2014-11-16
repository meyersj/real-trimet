function Interpolate() {
    
    var THIS = this;
    
    /*
    var last_x = null;
    var last_y = null;
    var new_x = null;
    var new_y = null;
    var cur_x = null;
    var cur_y = null;
    var arrival_est = null;
    var speed = 20;

    
    THIS.update = function (params) {
        THIS.last_x = params['last_x'];
        THIS.last_y = params['last_y'];
        THIS.new_x = params['new_x'];
        THIS.new_y = params['new_y'];
        THIS.cur_x = params['cur_x'];
        THIS.cur_y = params['cur_y'];
        THIS.arrival_est = params['arrival_est'];
    }

    This.interpolate = function() {
        var x_dist = new_x - cur_x;
        var y_dist = new_y - cur_y; 
    }
    */

    THIS.project = function(coords) {
        //coords are coordinates in EPSG:4326
        console.log(coords);
        var new_projection = PROJ[2913];
        var new_coords = proj4(new_projection, coords);
        console.log(new_coords);
        return new_coords;
    }
   

    function stop_lookup(stop_id) {




    }
    THIS.interpolate = function(current_coordinates, next_stop_id) {
        var cur_x = current_coordinates["x"];
        var cur_y= current_coordinates["y"];

        $.getJSON(THIS.URL + "/stop_lookup", {"stop_id":next_stop_id},function(data) {
            var resp = data.response;
            console.log(resp);  
        });
    }
    
    THIS.interpolate = function(speed, interval, data) {
        var cur_x = data["current"]["x"];
        var cur_y = data["current"]["y"];
        var new_x = data["new"]["x"];
        var new_y = data["new"]["y"];
        
        var x_diff = new_x - cur_x;
        var y_diff = new_y - cur_y;

        //total distance from current location
        //to new location
        var total_dist = Math.sqrt(
            Math.pow(x_diff, 2) + 
            Math.pow(y_diff, 2)
        );
       
        //x and y coordinates will be interpolated
        //based on travel speed and distance
        //to new location
        //coordinates are returned as EPSG:4326
        var ratio = interval / (total_dist / speed);
        var coords = proj4(PROJ[2913], PROJ[4326], {
            "x":cur_x + (x_diff * ratio),
            "y":cur_y + (y_diff * ratio)
        });
        
        console.log(coords);
        return coords;
    }
    
}
