import requests
import json

appid = "59E23608FABA109B7153953F2"

url = "http://developer.trimet.org/ws/V1/stops"
feet = "50000"
ll = "-122.6536383,45.5300491"

r = requests.get(url, params={"json":True, "ll":ll, "feet":feet, "appID":appid})
j = json.loads(r.content)

desc = "Hollywood/NE 42nd Ave TC MAX Station"

for stop in j['resultSet']['location']:
    if stop['desc'] == desc:
        print stop


