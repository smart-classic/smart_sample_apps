# Import some general modules
import json
import urllib
import web
import os
import sys

# Add the current directory to the system path so that python can mod_py could
# load the local modules
abspath = os.path.dirname(__file__)
sys.path.append(abspath)

# Import the local smart client modules and components
from smart_client import oauth
from smart_client.smart import SmartClient
from smart_client.common import rdf_ontology
from smart_client.generate_api import call_name

# Import the application settings
from settings import APP_PATH

from tests import runTest, getMessages

# Default configuration settings for the SMART client
SMART_SERVER_OAUTH = {
#    'consumer_key': 
    'consumer_secret': 'smartapp-secret'
}

SMART_SERVER_PARAMS = {
#    'api_base': 
}

# URL mappings for web.py
urls = ('/smartapp/index.html', 'index',
        '/smartapp/getcalls', 'get_calls',
        '/smartapp/apicall', 'api_call',
        '/smartapp/runtests', 'run_tests')
        
class index:
    def GET(self):
        f = open(APP_PATH + '/templates/index.html', 'r')
        html = f.read()
        f.close()
        return html

class get_calls:
    def GET(self):
        sc = get_smart_client(APP_PATH + '/data/smart.owl')

        out = {}

        for t in rdf_ontology.api_calls:
            path = str(t.path)
            method = str(t.method)
            target = str(t.target)
            category = str(t.category)
            if method == "GET" and (category == "record_items" or
                                    path == "/ontology" or
                                    path == "/apps/manifests/" or
                                    path == "/capabilities/"):
                out[target] = {"call_py": get_call(target)}

        return json.dumps(out, sort_keys=True, indent=4)
        
class api_call:
    def GET(self):
        call_name = web.input().call_name
        model = get_model(call_name)
        smart_client = get_smart_client(APP_PATH + '/data/smart.owl')
        method_to_call = getattr(smart_client, call_name)
        r = method_to_call()
        messages = getMessages(runTest(model,r.body,r.contentType))
        return json.dumps({'body':r.body, 'contentType':r.contentType, 'messages':messages})

class run_tests:
    def GET(self):
        model = web.input().model
        data = web.input().data
        contentType = web.input().content_type
        
        messages = getMessages(runTest(model,data,contentType))

        return json.dumps(messages, sort_keys=True, indent=4)
        
def get_call(target):
    '''Returns the name of the SMART python client convenience method
    corresponding to the target SMART data model
    
    Expects a valid SMART data model target
    '''
    class API_Call():
        def __init__ (self, path, method):
            self.path = path
            self.method = method

    r = rdf_ontology.get_api_calls()
    call = API_Call(r[target], "GET")
    return call_name(call)
    
def get_model(call):
    class API_Call():
        def __init__ (self, path, method):
            self.path = path
            self.method = method

    r = rdf_ontology.get_api_calls()
    for target in r.keys():
        if call == call_name(API_Call(r[target], "GET")):
            return target.replace("http://smartplatforms.org/terms#","")
        
def get_smart_client(ontology = None):
    '''Initializes and returns a new SMART Client
    
    Expects an OAUTH header as a REST parameter
    '''
    smart_oauth_header = web.input().oauth_header
    smart_oauth_header = urllib.unquote(smart_oauth_header)
    oa_params = oauth.parse_header(smart_oauth_header)
    SMART_SERVER_PARAMS['api_base'] = oa_params['smart_container_api_base']
    SMART_SERVER_OAUTH['consumer_key'] = oa_params['smart_app_id']

    oa_params = oauth.parse_header(smart_oauth_header)
    
    resource_tokens={'oauth_token':       oa_params['smart_oauth_token'],
                     'oauth_token_secret':oa_params['smart_oauth_token_secret']}

    ret = SmartClient(SMART_SERVER_OAUTH['consumer_key'], 
                       SMART_SERVER_PARAMS, 
                       SMART_SERVER_OAUTH, 
                       resource_tokens,
                       ontology)
                       
    ret.record_id=oa_params['smart_record_id']
    ret.user_id=oa_params['smart_user_id']
    ret.smart_app_id=oa_params['smart_app_id']
    
    return ret

# Initialize web.py
web.config.debug=False
app = web.application(urls, globals())

if __name__ == "__main__":
    app.run()
else:
    application = app.wsgifunc()