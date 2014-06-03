"""
The minimal Flask-based SMART REST app for SMART version 1.0 and later.

Arjun Sanyal
Pascal Pfiffner
"""

import flask
import logging
from smart_client.client import SMARTClient

###########################################################################
# Configuration
###########################################################################
# SMART Container OAuth Endpoint Configuration
_ENDPOINT = {
    "url": "http://sandbox-api.smartplatforms.org",  # aka "api_base"
    "name": "SMART Sandbox API v0.6.2",
    "app_id": "my-app@apps.smartplatforms.org",
    "consumer_key": "my-app@apps.smartplatforms.org",
    "consumer_secret": "smartapp-secret"
}

# Other Configuration (you shouldn't need to change this)
logging.basicConfig(level=logging.DEBUG)  # cf. .INFO; default is WARNING
application = app = flask.Flask(  # Some PaaS need "application"
    'wsgi',
    template_folder='app',
    static_folder='app/static',
    static_url_path='/static'
)
app.debug = True
app.secret_key = 'mySMARTrestAPPrules!!'  # only for encrypting the session


###########################################################################
# SMARTClient and OAuth Helper Functions
###########################################################################
def _init_smart_client(record_id=None):
    """ Returns the SMART client, configured accordingly. """
    try:
        client = SMARTClient(_ENDPOINT.get('app_id'),
                             _ENDPOINT.get('url'),
                             _ENDPOINT)
    except Exception as e:
        logging.critical('Could not init SMARTClient: %s' % e)
        flask.abort(500)
        return

    # initial client setup doesn't require record_id
    client.record_id = record_id
    return client


def _test_acc_token(client):
    """ Tests access token by trying to fetch a records basic demographics """
    try:
        demo = client.get_demographics()
        status = demo.response.get('status')
        if '200' == status:
            return True
        else:
            logging.warning('get_demographics returned non-200 status: ' +
                            demo.response.get('status'))
            return False
    except Exception as e:
        return False


def _request_token_for_record(record_id, client):
    """ Requests a request token for a given record_id """
    logging.debug("Req'd token for %s at %s", record_id, _ENDPOINT.get('url'))
    try:
        req_token = client.fetch_request_token()
        sessions = flask.session['sessions']
        sessions[record_id] = {'req_token': req_token, 'acc_token': None}
        flask.session['sessions'] = sessions
        flask.session['auth_in_progress_record_id'] = record_id

    except Exception as e:
        logging.critical('Could not fetch_request_token: %s' % e)
        flask.abort(500)


def _exchange_token(record_id, req_token, verifier):
    """ Exchanges verifier for an acc_token and stores it in the session """
    client = _init_smart_client(record_id)
    client.update_token(req_token)

    try:
        acc_token = client.exchange_token(verifier)
    except Exception as e:
        logging.critical("Token exchange failed: %s" % e)
        flask.abort(500)

    # success, store it!
    logging.debug("Exchanged req_token for acc_token: %s" % acc_token)
    sessions = flask.session['sessions']
    s = sessions.get(record_id)
    s['acc_token'] = acc_token
    sessions[record_id] = s
    flask.session['sessions'] = sessions


###########################################################################
# App URLs
###########################################################################

@app.route('/')
@app.route('/smartapp/index.html')
def index():
    """
        This functions responds to both "/" and "/smartapp/index.html" so
        it works as a locally-access REST app at http://localhost:8000 and
        the "MyApp" app inside the SMART Reference container at
        http://localhost:8000/smartapp/index.html
    """
    record_id = flask.request.args.get('record_id')
    logging.debug('record_id: %s', record_id)

    if not record_id:
        # no record_id, redirect to record selection page
        flask.session['sessions'] = {}
        client = _init_smart_client()  # just init to get launch_url
        assert client.launch_url, "No launch_url found in client. Aborting."
        logging.debug('Redirecting to app launch_url: %s', client.launch_url)
        return flask.redirect(client.launch_url)

    # check if we already have a valid acc_token in the sessions object
    reauth_required_p = False

    sessions = flask.session.get('sessions', {})
    if not sessions:
        # no sessions object, create a fresh one
        flask.session['sessions'] = {}
        reauth_required_p = True

    session = sessions.get(record_id, {})
    if not session:
        # no session for this record_id in the sessions object, create one
        sessions[record_id] = {}
        flask.session['sessions'] = sessions
        reauth_required_p = True

    client = _init_smart_client(record_id)

    acc_token = session.get('acc_token', None)
    if not acc_token:
        # missing acc_token for this session
        reauth_required_p = True
    else:
        client.update_token(acc_token)

        if not _test_acc_token(client):
            reauth_required_p = True

    if reauth_required_p:
        # start the OAuth dance: get a fresh req_token and session
        _request_token_for_record(record_id, client)

        # start the OAuth dance and redirect to the authorize page
        logging.debug("Redirecting to authorize url")
        return flask.redirect(client.auth_redirect_url)
    else:
        logging.debug('valid acc_token: %s', acc_token)

    # Now we're ready to get data! Get demographics and display the name.
    demo = client.get_demographics()
    sparql = """
        PREFIX vc: <http://www.w3.org/2006/vcard/ns#>
        SELECT ?given ?family
        WHERE {
            [] vc:n ?vcard .
            OPTIONAL { ?vcard vc:given-name ?given . }
            OPTIONAL { ?vcard vc:family-name ?family . }
        }
    """
    results = demo.graph.query(sparql)
    record_name = 'Unknown'
    if len(results) > 0:
        res = list(results)[0]
        record_name = '%s %s' % (res[0], res[1])

    return flask.render_template('index.html',
                                 api_base=_ENDPOINT.get('url'),
                                 record_id=record_id,
                                 record_name=record_name)


@app.route('/smartapp/authorize')
def authorize():
    """ Extract the oauth_verifier and exchange it for an access token. """
    new_oauth_token = flask.request.args.get('oauth_token')
    record_id = flask.session['auth_in_progress_record_id']

    # confirm the token is the same as the one saved for this record_id
    sessions = flask.session['sessions']
    session = sessions.get(record_id)
    req_token = session.get('req_token')
    assert new_oauth_token == req_token.get('oauth_token')

    # now use the verifier to get the access token
    _exchange_token(record_id,
                    req_token,
                    flask.request.args.get('oauth_verifier'))

    return flask.redirect('/smartapp/index.html?api_base=%s&record_id=%s' % (
        _ENDPOINT.get('url'),
        record_id
    ))

###########################################################################

if __name__ == '__main__':
    app.run(port=8000)
