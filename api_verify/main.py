'''SMART API Verifier main controller'''
# Developed by: Nikolai Schwertner
#
# Revision history:
#     2012-02-24 Initial release
#     2013-03-27 Upgraded to SMART v0.6 OAuth - Arjun Sanyal


import json
import urllib
import web
import os
import sys

abspath = os.path.dirname(__file__)
sys.path.append(abspath)

from smart_client import oauth
from smart_client.smart import SmartClient
from smart_client.common.rdf_tools import rdf_ontology

from settings import APP_PATH, ONTOLOGY
from tests import runTest, getMessages, describeQueries

###########################################################################
# Configuration
###########################################################################

# SMART Container OAuth Endpoint Configuration
_ENDPOINT = {
    "url": "http://localhost:8000",
    "name": "Localhost",
    "app_id": "api-verifier@apps.smartplatforms.org",
    "consumer_key": "api-verifier@apps.smartplatforms.org",
    "consumer_secret": "JgRyphxFJqWlzVgd"
}

###########################################################################
# SMARTClient and OAuth Helper Functions
###########################################################################

_smart = None  # A global flag to check is the SMARTClient is configured


def _smart_client(api_base, record_id=None):
    """ Returns the SMART client, configured accordingly. """
    global _smart
    if _smart is None:
        try:
            _smart = SMARTClient(_ENDPOINT.get('app_id'), api_base, _ENDPOINT)
        except Exception, e:
            #flask.abort(503)
            return

    _smart.record_id = record_id
    return _smart


def _request_token_for_record(api_base, record_id):
    """ Requests a request token for a given record_id """
    #flask.session['req_token'] = None
    logging.debug("Requesting token for %s on %s" % (record_id, api_base))
    smart = _smart_client(api_base, record_id)
    smart.token = None
    try:
        #flask.session['req_token'] = smart.fetch_request_token()
    except Exception, e:
        return False, str(e)

    return True, None


def _exchange_token(verifier):
    """ Exchanges verifier for an acc_token and stores it in the session """
    #record_id = flask.session['record_id']
    #req_token = flask.session['req_token']
    #api_base = flask.session['api_base']

    if record_id is None:
        logging.error("No record_id, cannot exchange %s" % req_token)
        return

    logging.debug("Exchanging token: %s" % req_token)
    smart = _smart_client(api_base, record_id)
    smart.update_token(req_token)

    try:
        acc_token = smart.exchange_token(verifier)
    except Exception, e:
        logging.error("Token exchange failed: %s" % e)
        return

    # success! store it
    logging.debug("Exchanged req_token for acc_token: %s" % acc_token)
    #flask.session['acc_token'] = acc_token
    smart.update_token(acc_token)
    return True


def _test_token():
    """ Tries to fetch demographics with session acc_token and returns a
        bool whether thas was successful. """

    #smart = _smart_client(flask.session['api_base'],
                          #flask.session['record_id'])
    if smart is None:
        return False

    #smart.update_token(flask.session['acc_token'])
    try:
        demo = smart.get_demographics()
        if '200' == demo.response.get('status'):
            return True
    except Exception, e:
        pass

    return False


###########################################################################
# App URLs
###########################################################################

# URL mappings for web.py
urls = ('/smartapp/index.html', 'index',
        '/smartapp/authorized', 'authorized',
        '/smartapp/getcalls', 'get_calls',
        '/smartapp/apicall', 'api_call',
        '/smartapp/runtests', 'run_tests',
        '/smartapp/describe', 'describe_queries')


class index:
    '''Disseminator for the SMART tester index page'''
    def GET(self):
        template_html = web.template.frender(APP_PATH + '/templates/index.html')
        html = template_html("0.6")
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
            pass  # rdf_ontology.parse_ontology(open(ONTOLOGY).read())

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
            if method == "GET" and \
               ((category == "record" and cardinality == "multiple") or
                t.client_method_name in (
                    "get_demographics",
                    "get_ontology",
                    "get_container_manifest",
                    "get_app_manifests",
                    "get_user_preferences")):

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
        messages = getMessages(runTest(model, r.body, r.contentType))

        # Encode and return the call and tests result as JSON
        return json.dumps(
            {
                'body': r.body,
                'contentType': r.contentType,
                'messages': messages
            }, sort_keys=True, indent=4)


class run_tests:
    def POST(self):
        '''Executes the appropriate series of tests for a given SMART data model'''

        # Get the input data from the HTTP header
        model = web.input().model
        data = web.input().data
        contentType = web.input().content_type

        # Run the tests and obtain the failure messages
        messages = getMessages(runTest(model, data, contentType))

        # Return the failure messages encoded as JSON
        return json.dumps(messages, sort_keys=True, indent=4)


class describe_queries:
    def GET(self):
        '''Returns a string describing the test queries used in testing a data model'''

        # Get the input data from the HTTP header
        model = web.input().model

        # Return description
        return describeQueries(model)


def get_api_calls():
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
            return c.target.replace("http://smartplatforms.org/terms#", "")


def get_smart_client(ontology=None):
    '''Initializes and returns a new SMART Client

    Expects an OAUTH header as a REST parameter
    '''
    smart_oauth_header = web.input().oauth_header
    smart_oauth_header = urllib.unquote(smart_oauth_header)
    oa_params = oauth.parse_header(smart_oauth_header)
    SMART_SERVER_PARAMS['api_base'] = oa_params['smart_container_api_base']
    SMART_SERVER_OAUTH['consumer_key'] = oa_params['smart_app_id']

    oa_params = oauth.parse_header(smart_oauth_header)

    resource_tokens = {
        'oauth_token': oa_params['smart_oauth_token'],
        'oauth_token_secret': oa_params['smart_oauth_token_secret']
    }

    ret = SmartClient(SMART_SERVER_OAUTH['consumer_key'],
                      SMART_SERVER_PARAMS,
                      SMART_SERVER_OAUTH,
                      resource_tokens,
                      ontology)

    ret.record_id = oa_params['smart_record_id']
    ret.user_id = oa_params['smart_user_id']
    ret.smart_app_id = oa_params['smart_app_id']
    return ret


# Initialize web.py
web.config.debug = False
app = web.application(urls, globals())

if __name__ == "__main__":
    app.run()
else:
    application = app.wsgifunc()
