'''SMART API Verifier main controller'''
# Developed by: Nikolai Schwertner
#
# CONFIG: Change the consumer_secret in _ENDPOINT!
#
# Revision history:
#     2012-02-24 Initial release
#     2013-03-27 Upgraded to SMART v0.6 OAuth - Arjun Sanyal

import os
import sys

abspath = os.path.dirname(__file__)
sys.path.append(abspath)

import logging
import json
import tempfile
import time
import urllib
import web

from smart_client.client import SMARTClient
from smart_client.common.rdf_tools import rdf_ontology
from settings import APP_PATH, ONTOLOGY_PATH
from tests import runTest, getMessages, describeQueries
from threading import Lock

# Configuration
###########################################################################

logging.basicConfig(level=logging.DEBUG)

# SMART Container OAuth Endpoint Configuration
_ENDPOINT = {
    "url": "http://sandbox-api-v06.smartplatforms.org/",
    "name": "Localhost",
    "app_id": "api-verifier@apps.smartplatforms.org",
    "consumer_key": "api-verifier@apps.smartplatforms.org",
    "consumer_secret": "changeme"
}

# webpy file based sessions
###########################################################################

_session = web.session.DiskStore(tempfile.mkdtemp())

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
            logging.critical("Could not init SMARTClient. " + str(e))

    _smart.record_id = record_id
    return _smart


def _request_token_for_record(api_base, record_id):
    """ Requests a request token for a given record_id """
    global _session
    _session['req_token'] = None
    logging.debug("Requesting token for %s on %s" % (record_id, api_base))
    smart = _smart_client(api_base, record_id)
    smart.token = None
    try:
        _session['req_token'] = smart.fetch_request_token()
    except Exception, e:
        return False, str(e)

    return True, None


def _exchange_token(verifier):
    """ Exchanges verifier for an acc_token and stores it in the session """
    global _session
    record_id = _session['record_id']
    req_token = _session['req_token']
    api_base = _session['api_base']

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
    _session['acc_token'] = acc_token
    smart.update_token(acc_token)

    # store in cookies too
    web.setcookie('oauth_token_secret', acc_token['oauth_token_secret'])
    web.setcookie('oauth_token', acc_token['oauth_token'])
    web.setcookie('user_id', acc_token['user_id'])
    web.setcookie('api_base', api_base)
    web.setcookie('record_id', record_id)
    return True


def _test_token():
    """ Tries to fetch demographics with session acc_token and returns a
        bool whether thas was successful. """

    smart = _smart_client(_session['api_base'],
                          _session['record_id'])
    if smart is None:
        return False

    smart.update_token(_session['acc_token'])
    try:
        demo = smart.get_demographics()
        if '200' == demo.response.get('status'):
            return True
    except Exception, e:
        pass

    return False


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
        # We should have the api_base and record_id in the query string
        # e.g we're not going to redirect to the record selection UI
        global _session
        _session['api_base'] = api_base = _ENDPOINT.get('url')
        _session['record_id'] = record_id = web.input().get('record_id')

        logging.debug('api_base: ' + str(api_base) +
                      ' record_id: ' + str(record_id))

        # Init the SMARTClient
        smart = _smart_client(api_base, record_id)

        # Do we have a valid access token?
        if 'acc_token' not in _session or not _test_token():
            # Nope, clear the acc and req tokens
            web.setcookie('oauth_token_secret', '', -1)
            web.setcookie('oauth_token', '', -1)
            web.setcookie('record_id', '', -1)
            web.setcookie('user_id', '', -1)
            _session['acc_token'] = None
            _session['req_token'] = None
            fetched, error_msg = _request_token_for_record(api_base, record_id)

            if fetched:
                logging.debug("Redirecting to authorize url: " +
                              smart.auth_redirect_url)
                raise web.seeother(smart.auth_redirect_url)
            if error_msg:
                logging.debug('_request_token_for_record failed')
                web.internalerror()

        # We are good to go
        template_html = web.template.frender(APP_PATH +
                                             '/templates/index.html')
        html = template_html("0.6")
        web.header('Content-Type', 'text/html')
        return html


class authorized:
    def GET(self):
        """ Extract the oauth_verifier and exchange it for an access token. """
        global _session
        new_oauth_token = web.input().oauth_token
        req_token = _session['req_token']
        api_base = _session['api_base']
        record_id = _session['record_id']

        if new_oauth_token != req_token.get('oauth_token', None):
            logging.critical('Token mismatch in /authorize! Aborting.')
            web.internalerror()
            return

        if _exchange_token(web.input().oauth_verifier):
            return web.seeother(
                '/smartapp/index.html?api_base=%s&record_id=%s' %
                (api_base, record_id))
        else:
            logging.critical('Could not exchange token.')
            web.internalerror()


class get_calls:
    def GET(self):
        '''Returns the available python client calls based on the ontology'''

        out = {}
        for t in rdf_ontology.api_calls:
            path = str(t.path)
            method = str(t.http_method)
            target = str(t.target)
            category = str(t.category)
            cardinality = str(t.cardinality)

            # Process only GET calls of "record_items" category plus a few
            # specific exceptions by adding them to the dictionary
            if method == "GET" and \
               ((category == "record" and cardinality == "multiple") or
                t.client_method_name in (
                    "get_demographics",
                    "get_ontology",
                    "get_container_manifest",
                    "get_app_manifests",
                    "get_user_preferences")):

                # Build the generic python client call name and use it
                # in the dictionary
                out[target] = str(t.client_method_name)

        return json.dumps(out, sort_keys=True, indent=4)


class api_call:
    def POST(self):
        '''Executes a python client API call identified by its generic name'''
        global _smart

        # make sure the SMARTClient is init'd
        cookies = web.cookies()
        api_base = cookies.api_base
        record_id = cookies.record_id

        # reconstruct acc_token from cookies
        acc_token = {
            'oauth_token_secret': cookies.oauth_token_secret,
            'oauth_token': cookies.oauth_token,
            'record_id': record_id,
            'user_id': cookies.user_id
        }

        logging.debug('Cookies are: api_base: ' + api_base +
                ' record_id: ' + record_id +
                ' acc_token: ' + str(acc_token))

        smart = _smart_client(api_base, record_id)
        if smart is None:
            return False

        smart.update_token(acc_token)

        call_name = web.input().call_name

        # Figure out the SMART model corresponding to the API call
        model = get_model(call_name)

        logging.debug('Calling ' + call_name)
        method_to_call = getattr(SMARTClient, call_name)
        r = method_to_call(_smart)

        # Run the API tests on the result of the call
        contentType = r.response.get('content-type', None)
        messages = getMessages(runTest(model, r.body, contentType))

        # Encode and return the call and tests result as JSON
        return json.dumps({
            'body': r.body,
            'contentType': contentType,
            'messages': messages
        }, sort_keys=True, indent=4)


class run_tests:
    def POST(self):
        '''Executes the appropriate series of tests for a given data model'''

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
        '''Returns a string describing the queries used in testing a DM'''
        model = web.input().model
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
        rdf_ontology.parse_ontology(open(ONTOLOGY_PATH).read())

    # Look through the api calls array until a call with matching
    # convenience method name is found
    for c in rdf_ontology.api_calls:
        if call == c.client_method_name:
            return c.target.replace("http://smartplatforms.org/terms#", "")


# Simulate single threading using a mutex. This is to prevent errors
# in httplib2 (used by oauth2) which is comically not threadsafe! Argh!!!
def mutex_processor():
    mutex = Lock()

    def processor_func(handle):
        mutex.acquire()
        try:
            return handle()
        finally:
            mutex.release()
    return processor_func


web.config.debug = False
app = web.application(urls, globals())
app.add_processor(mutex_processor())

if __name__ == "__main__":
    app.run()
else:
    application = app.wsgifunc()
