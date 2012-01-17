import json

from smart_client.smart import SmartClient
from settings import PROXY_OAUTH, PROXY_PARAMS

def get_app_manifests():
        smart_client = SmartClient(PROXY_OAUTH['consumer_key'], PROXY_PARAMS, PROXY_OAUTH, None)
        res = smart_client.get("/apps/manifests/")
        apps = json.loads(res.body)
        apps = sorted(apps, key=lambda app: app['name'])
        return json.dumps(apps, indent=4)