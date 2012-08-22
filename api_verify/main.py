'''SMART API Verifier main controller'''
# Developed by: Nikolai Schwertner
#
# Revision history:
#     2012-02-24 Initial release

# Import some general modules
import json
import urllib
import web
import os
import sys

# Add the current directory to the system path so that mod_py could
# load the local modules
abspath = os.path.dirname(__file__)
sys.path.append(abspath)

# Import the local smart client modules and components
from smart_client import oauth
from smart_client.smart import SmartClient
from smart_client.common.rdf_tools import rdf_ontology

# Import the application settings
from settings import APP_PATH, ONTOLOGY

# Import the testing framework utilities
from tests import runTest, getMessages, describeQueries

# Default configuration settings for the SMART client
SMART_SERVER_OAUTH = {
#    'consumer_key': 
    'consumer_secret': 'smartapp-secret'
}

SMART_SERVER_PARAMS = {
#    'api_base': 
}

# URL mappings for web.py
urls = ('/smartapp/index.html', 'index05',
        '/smartapp/index-0.5.html', 'index05',
        '/smartapp/index-0.4.html', 'index04',
        '/smartapp/index-0.3.html', 'index03',
        '/smartapp/getcalls', 'get_calls',
        '/smartapp/apicall', 'api_call',
        '/smartapp/runtests', 'run_tests',
        '/smartapp/describe', 'describe_queries')

class index05:
    '''Disseminator for the SMART v0.5 tester index page'''
    def GET(self):
        template_html = web.template.frender(APP_PATH + '/templates/index.html')
        html = template_html("0.5")
        web.header('Content-Type', 'text/html')
        return html
        
class index04:
    '''Disseminator for the SMART v0.4 tester index page'''
    def GET(self):
        template_html = web.template.frender(APP_PATH + '/templates/index.html')
        html = template_html("0.4")
        web.header('Content-Type', 'text/html')
        return html
        
class index03:
    '''Disseminator for the SMART v0.3 tester index page'''
    def GET(self):
        template_html = web.template.frender(APP_PATH + '/templates/index.html')
        html = template_html("0.3")
        web.header('Content-Type', 'text/html')
        return html

class get_calls:
    def GET(self):
        '''Returns the available python client calls based on the ontology'''
        
        # Load the local copy of the ontology via the SMART client
        try:
            sc = get_smart_client(ONTOLOGY)
        except:
            # When the oauth credentials are bad or another execption occurs,
            # perform a manual ontology parsing routine which blocks any
            # consequent SMART client instantiations
            pass #rdf_ontology.parse_ontology(open(ONTOLOGY).read())

        # Initialize the output dictionary
        out = {}

        # Iterate over the ontology calls
        for t in rdf_ontology.api_calls:
        
            # Fetch the metadata of the api call
            path = str(t.path)
            method = str(t.http_method)
            target = str(t.target)
            category = str(t.category)
            cardinality = str(t.cardinality)
            
            # Process only GET calls of "record_items" category plus a few specific
            # exceptions by adding them to the dictionary
            if method == "GET" and ((category == "record" and cardinality == "multiple") or
                                    path == "/ontology" or
                                    path == "/apps/manifests/" or
                                    path == "/manifest"):

                # Build the generic python client call name and use it in the dictionary
                out[target] = str(t.client_method_name)

        # Return the dictionary serialized as "pretty" JSON
        return json.dumps(out, sort_keys=True, indent=4)
        
class api_call:
    def POST(self):
        '''Executes a python client API call identified by its generic name'''
        
        # Get the call name from the HTTP header
        call_name = web.input().call_name
        
        # Load the local ontology into the SMART client
        smart_client = get_smart_client(ONTOLOGY)
        
        # Figure out the SMART model corresponding to the API call
        model = get_model(call_name)
        
        # Get a reference to the conveninence method in the SMART client and execute the call
        method_to_call = getattr(smart_client, call_name)
        r = method_to_call()
        
        # Run the API tests on the result of the call
        messages = getMessages(runTest(model,r.body,r.contentType))
        
        # Encode and return the call and tests result as JSON
        return json.dumps({'body':r.body, 'contentType':r.contentType, 'messages':messages}, sort_keys=True, indent=4)

class run_tests:
    def POST(self):
        '''Executes the appropriate series of tests for a given SMART data model'''
        
        # Get the input data from the HTTP header
        model = web.input().model
        data = web.input().data
        contentType = web.input().content_type
        
        # Run the tests and obtain the failure messages
        messages = getMessages(runTest(model,data,contentType))

        # Return the failure messages encoded as JSON
        return json.dumps(messages, sort_keys=True, indent=4)

class describe_queries:
    def GET(self):
        '''Returns a string describing the test queries used in testing a data model'''
        
        # Get the input data from the HTTP header
        model = web.input().model

        # Return description
        return describeQueries(model)
        
def get_api_calls ():
    calls = {}
    
    for t in rdf_ontology.api_calls:

        target = str(t.target)
        method = str(t.http_method)
        path = str(t.path)
        category = str(t.category)

        if method == "GET" and (category == "record_items" or
                                    path == "/ontology" or
                                    path == "/apps/manifests/" or
                                    path == "/manifest"):
            if target not in calls.keys():
                calls[target] = path
            
    return calls
    
def get_model(call):
    '''Returns the name of the target SMART data model
    corresponding to the SMART python client convenience method
    
    Expects a valid SMART python client convenience method name
    '''

    # We may have to load the ontology if it is not available yet
    if not rdf_ontology.api_types:
        rdf_ontology.parse_ontology(open(ONTOLOGY).read())
    
    # Look through the api calls array until a call with matching convenience method name is found
    for c in rdf_ontology.api_calls:
        if call == c.client_method_name:
            return c.target.replace("http://smartplatforms.org/terms#","")
        
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