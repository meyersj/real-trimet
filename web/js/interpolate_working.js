var cur = {x:7649371.607030949, y:676327.9312206988};
var next = {x:7649050.22241837, y:676377.548054868};


function interpolate(cur, next, speed) {
    var ret_val = {};
    
    var x_diff = Math.abs(next.x - cur.x);
    var y_diff = Math.abs(next.y - cur.y);
    var angle = Math.atan(y_diff / x_diff);
    
    var x = Math.cos(angle) * speed;
    var y = Math.sin(angle) * speed;    
        
    if (next.y - cur.y < 0) {
        y = y * -1.0   
    }
    if (next.x - cur.x < 0) {
        x = x * -1.0   
    }
    
    ret_val.x = x;
    ret_val.y = y;
    
    return ret_val;
}

var speed = 19.0;

console.log(interpolate(cur, next, speed));
