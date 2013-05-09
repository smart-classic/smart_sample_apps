"""
The minimal Flask-based SMART REST app for SMART version 0.6 and later.

Arjun Sanyal <arjun dot sanyal at childrens harvard edu>
Pascal Pfiffner <pascal dot pfiffner at childrens.harvard.edu>
"""

import flask
import logging
from smart_client.client import SMARTClient

###########################################################################
# Configuration
###########################################################################
# SMART Container OAuth Endpoint Configuration
_ENDPOINT = {
    "url": "http://sandbox-api-v06.smartplatforms.org",
    "name": "SMART Sandbox API v0.6",
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


def _request_token_for_record(client):
    """ Requests a request token for a given record_id """
    flask.session['acc_token'] = None
    flask.session['req_token'] = None
    logging.debug("Requesting token for %s on %s" % (
        flask.session['record_id'],
        flask.session['api_base'])
    )
    try:
        flask.session['req_token'] = client.fetch_request_token()
    except Exception as e:
        logging.critical('Could not fetch_request_token: %s' % e)
        flask.abort(500)


def _exchange_token(verifier):
    """ Exchanges verifier for an acc_token and stores it in the session """
    record_id = flask.session['record_id']
    req_token = flask.session['req_token']
    assert record_id and req_token

    client = _init_smart_client(record_id)
    client.update_token(req_token)

    try:
        acc_token = client.exchange_token(verifier)
    except Exception as e:
        logging.critical("Token exchange failed: %s" % e)
        flask.abort(500)

    # success, store it!
    logging.debug("Exchanged req_token for acc_token: %s" % acc_token)
    flask.session['acc_token'] = acc_token


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
    api_base = flask.session['api_base'] = _ENDPOINT.get('url')
    current_record_id = flask.session.get('record_id')
    args_record_id = flask.request.args.get('record_id')

    logging.debug('current_record_id: ' + str(current_record_id))
    logging.debug('args_record_id: ' + str(args_record_id))

    if not args_record_id:
        # no record id in the req, clear session and redir to record selection
        flask.session['acc_token'] = None
        flask.session['req_token'] = None
        client = _init_smart_client()  # just init to get launch_url
        assert client.launch_url, "No launch_url found in client. Aborting."
        logging.debug('Redirecting to app launch_url: ' + client.launch_url)
        return flask.redirect(client.launch_url)

    # set the correct, new record_id and clear the session if required
    if current_record_id != args_record_id:
        record_id = flask.session['record_id'] = args_record_id
        flask.session['acc_token'] = None
        flask.session['req_token'] = None
    else:
        record_id = current_record_id

    logging.debug('record_id: ' + record_id)

    client = _init_smart_client(record_id)

    acc_token = flask.session.get('acc_token')

    logging.debug('acc_token is: ' + str(acc_token))

    if not acc_token:
        _request_token_for_record(client)
        logging.debug("Redirecting to authorize url")
        return flask.redirect(client.auth_redirect_url)
    else:
        client.update_token(flask.session['acc_token'])

    assert _test_acc_token(client)

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
                                 api_base=api_base,
                                 record_id=record_id,
                                 record_name=record_name)


@app.route('/smartapp/authorize')
def authorize():
    """ Extract the oauth_verifier and exchange it for an access token. """
    new_oauth_token = flask.request.args.get('oauth_token')
    req_token = flask.session['req_token']
    api_base = flask.session['api_base']
    record_id = flask.session['record_id']
    assert new_oauth_token == req_token.get('oauth_token')
    assert api_base and record_id

    _exchange_token(flask.request.args.get('oauth_verifier'))
    return flask.redirect('/smartapp/index.html?api_base=%s&record_id=%s' %
                          (api_base, record_id))

###########################################################################

if __name__ == '__main__':
    app.run(port=8000)
