from flask import request, jsonify, Blueprint

from api import db, app, debug

mod_api = Blueprint('api', __name__, url_prefix="")

STOP_ID = "stop_id"

@mod_api.route("/")
def index():
    return "API"

@mod_api.route("/stop_lookup", methods = ['GET'])
def stop_lookup():
    response = {}
    response["error"] = True

    if STOP_ID in request.args:
        stop_id = request.args[STOP_ID]    
        debug(stop_id)

        results = db.execute("""
	    SELECT
	        stop_name,
	        stop_id,
	        ST_X(ST_Transform(geom, 2913)) AS x,
	        ST_Y(ST_Transform(geom, 2913)) AS y
	    FROM gtfs.stops
	    WHERE stop_id = :stop_id
	    LIMIT 1;""", {"stop_id":stop_id})

        data = results.fetchone()
        
	#return coordinates in Oregon State Plane North - EPSG:2913
	if data:
	    response['stop_name'] = data['stop_name']
            response['stop_id'] = data['stop_id']
            response['coord'] = {}
            response['coord']['x'] = data['x']
            response['coord']['y'] = data['y']
            response['error'] = False

    return jsonify(response=response)

