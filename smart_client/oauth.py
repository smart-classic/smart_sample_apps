"""
OAuth support for Django and most Python web toolkits.

- derived from the default OAuth implementation,
- refactored for extensibility, and to not impose a data model by default
- focused on HTTP header auth (no POST or GET, those are not good options)
- focused on HMAC-SHA1 auth and eventually RSA-SHA1 (plaintext is not good enough)
- includes the oauth request body hash extension with additional content-type checking.

Ben Adida (ben.adida@childrens.harvard.edu)
2009-02-13

Using the oAuth client:

# prepare the oauth client
consumer = OAuthConsumer(consumer_key='gpp', secret='gpp')
token = OAuthToken(token='accesstoken', secret='accesssecret')
client = OAuthClient(consumer = consumer)
# client.set_token(token)

# prepare the request
http_request = HTTPRequest('POST', 'http://localhost:8000/oauth/request_token', data = None)
result = client.access_resource(http_request)

print result
"""

import cgi
import urllib, urllib2, urlparse, cgi
import time
import random
import urlparse
import hmac, hashlib
import base64
import logging, copy,string

VERSION = '1.0'
TIMESTAMP_THRESHOLD = 300

## removed var_check

class HTTPRequest(object):
  """
  A simple framework-independent wrapper for a basic HTTP request

  data is raw strings
  """
  
  FORM_URLENCODED_TYPE = 'application/x-www-form-urlencoded'
  TEXT_PLAIN = 'text/plain'

  def __init__(self, method, path, data_content_type=FORM_URLENCODED_TYPE, data='', headers={}):
    self.method       = method
    self.path         = path
    self.data_content_type  = data_content_type
    self.data         = data
    self.headers      = headers

##
## Model classes for consumer and token
## These do not have to be used, they can be replaced by classes that 
## answer to the same methods and public variables.
##

# OAuthConsumer is a data type that represents the identity of the Consumer
# via its shared secret with the Service Provider.
class OAuthConsumer(object):
  def __init__(self, consumer_key, secret):
    self.consumer_key = consumer_key
    self.secret = secret

# OAuthToken is either an access or request token.   
class OAuthToken(object):
  def __init__(self, token, secret, **params):
    '''
    key = the token
    secret = the token secret
    params = other parameters that need to be bundled in, e.g. oauth_callback_url,...
    '''
    self.token = token
    self.secret = secret
    self.params = params

  def to_string(self):
    params = copy.copy(self.params)
    params['oauth_token'] = self.token
    params['oauth_token_secret'] = self.secret
    return urllib.urlencode(params)

  # return a token from something like:
  # oauth_token_secret=digg&oauth_token=digg
  @staticmethod   
  def from_string(s):
    params = cgi.parse_qs(s, keep_blank_values=False)
    key = params['oauth_token'][0]
    secret = params['oauth_token_secret'][0]

    del params['oauth_token']
    del params['oauth_token_secret']

    return OAuthToken(key, secret, **params)

  __str__ = to_string



##
## Signature Methods
##

class OAuthSignatureMethod(object):
  def get_name(self):
    # -> str
    raise NotImplementedError

  def sign(self, message, consumer, token):
    # -> str
    raise NotImplementedError

  def verify(self, message, consumer, token, signature):
    # -> bool
    raise NotImplementedError

class OAuthSignatureMethod_HMAC_SHA1(OAuthSignatureMethod):

  def get_name(self):
    return 'HMAC-SHA1'
    
  def sign(self, message, consumer, token):
    signature = ''
    secret_str = 'secret'
    if consumer and hasattr(consumer, secret_str):
      hmac_key = escape(consumer.secret)+ '&'
      if token and hasattr(token, secret_str):
        hmac_key += escape(token.secret)
      # hmac object
      try:
        import hashlib # 2.5
        hashed = hmac.new(hmac_key, message, hashlib.sha1)
      except:
        import sha # deprecated
        hashed = hmac.new(hmac_key, message, sha)

      # calculate the digest base 64
      signature = base64.b64encode(hashed.digest())
    return signature

  def verify(self, message, consumer, token, signature):
    # hmac verification is just about re-generating the same signature
    computed_sig = self.sign(message, consumer, token)
    return signature == computed_sig


SIGNATURE_METHODS = {}

# populate the metadata in SIGNATURE_METHODS
for m_class in [OAuthSignatureMethod_HMAC_SHA1]:
  method = m_class()
  SIGNATURE_METHODS[method.get_name()] = method

##
## The OAuth Request Object
##

class OAuthRequest(object):
  '''
  A transport-code-independent representation of an oauth request
  including all calls for signing and verifying.
  '''

  DEFAULT_PARAMETERS = ['oauth_consumer_key', 'oauth_token', 'oauth_signature_method', 'oauth_signature', 'oauth_timestamp', 'oauth_nonce', 'oauth_version']

  ACCESS_TOKEN = "access"
  REQUEST_TOKEN = "request"

  SIGNATURE_METHOD = SIGNATURE_METHODS['HMAC-SHA1']

  def __init__(self, consumer, token, http_request, oauth_parameters={'oauth_callback':'oob'}, realm = ''):
    """
    Create an OAuth request, independent of transport code.
    
    consumer and token are for oauth authentication
    consumer cannot be null, token may be null but only if explicitly specified
    if token is null, then the request will be consumer-signed only,
    e.g. for requesting a request token.

    in http_request:
    method and url indicate the resource accessed.
    url should *not* contain any query parameters or fragment identifier 
    data is a dict of parameters for the URL that
    will be transformed into a query string or POST body depending on method.

    oauth_parameters contains parameters named oauth_,
    but should *not* contain default ones, which are computed by this library.

    realm need not be specified
    """

    if not consumer:
      raise OAuthError("You must specify a consumer")

    # can only feed non default parameters
    if len(set(oauth_parameters.keys()) & set(OAuthRequest.DEFAULT_PARAMETERS)) > 0:
      raise OAuthError("Some of the parameters are trying to override default parameters. You cannot do that.")

    self.consumer = consumer
    self.token = token

    self.token_type = None

    # make a copy for immutability
    self.http_request = copy.copy(http_request)
    self.oauth_parameters = copy.copy(oauth_parameters)

    self.signature = None

    self.realm = realm

    # process the HTTP Request, in particular check the content-type
    if self.http_request.data_content_type == HTTPRequest.FORM_URLENCODED_TYPE or self.http_request.method == "GET" or self.http_request.data == '':
      if (self.http_request.data and \
          (isinstance(self.http_request.data, str) or \
            isinstance(self.http_request.data, unicode))) or \
          self.http_request.data == '': 
        self.data = parse_qs(self.http_request.data)
      else:
        if self.http_request.data == None:
          self.data = {}
        else:
          raise OAuthError("Query string must be a string")
      self.__hash_body = False
    else:
      # no data parameters to sign, but as per Request Body Hash Extension.
      self.data = {}
      self.__hash_body = True

    # check that there are no matching params between data and oauth_parameters
    # as that would indicate a misunderstanding by the developer
    if len(set(oauth_parameters.keys()) & set(self.data.keys())) > 0:
      raise OAuthError("You have some common parameters in your HTTP data and your oauth parameters. That's not good.")
          

  def set_parameter(self, parameter, value):
    self.oauth_parameters[parameter] = value

  def get_parameter(self, parameter, default):
    self.oauth_parameters.get(parameter, default)

  def to_header(self, with_content_type = False):
    """
    serialize as a header for an HTTPAuth request
    """

    auth_header = 'OAuth realm="%s"' % self.realm

    # add the oauth parameters
    for k, v in self.oauth_parameters.iteritems():
      auth_header += ', %s="%s"' % (k, escape(str(v)))

    # add the signature
    auth_header += ", oauth_signature=\"%s\"" % escape(self.signature)

    headers = {'Authorization': auth_header}

    if with_content_type:
      headers['Content-type'] = self.http_request.data_content_type

    return headers

  def __do_hash_body(self):
    return base64.b64encode(hashlib.sha1(self.http_request.data).digest())

  def sign(self, signature_method = SIGNATURE_METHOD):
    """
    set the signature parameter to the result of build_signature
    """

    self.oauth_parameters['oauth_version'] = VERSION
    self.oauth_parameters['oauth_consumer_key'] = self.consumer.consumer_key
    if self.token:
      self.oauth_parameters['oauth_token'] = self.token.token
    self.oauth_parameters['oauth_nonce'] = generate_nonce()
    self.oauth_parameters['oauth_timestamp'] = generate_timestamp()

    # set the signature method
    self.oauth_parameters['oauth_signature_method'] = signature_method.get_name()
    
    # request body hash extension: depending on the content type, do this
    if self.__hash_body:
      self.set_parameter('oauth_body_hash', self.__do_hash_body())
      self.set_parameter('oauth_content_type', self.http_request.data_content_type)

    # generate the SBS
    sbs = self.get_signature_base_string()
    # set the signature
    self.signature = signature_method.sign(sbs, self.consumer, self.token)

  def verify(self, nonce_store):
    """
    Verify the request, which should be signed.
    This assumes that the proper consumer and token have been detected and loaded
    in the construction of the OAuthRequest object, typically in from_http_request
    """

    # check version compatibility, this will throw an exception if need be
    self.__check_version()

    # check timestamp, this will throw an exception if need be
    self.__check_timestamp()

    # check nonce, this will throw an exception if need be
    self.__check_nonce(nonce_store)

    # if request body hash extension, then check the content-type match and the hash match
    if self.__hash_body:
      # check content type
      if self.oauth_parameters.has_key('oauth_content_type'):
        if self.oauth_parameters['oauth_content_type'] != self.http_request.data_content_type:
          return None
      else:
        pass #Error out?

      # check hash
      if self.oauth_parameters.has_key('oauth_body_hash'):
        if self.oauth_parameters['oauth_body_hash'] != self.__do_hash_body():
          return None
      else:
        pass #Error out?

    # compute signature base string
    signature_base_string = self.get_signature_base_string()

    # lookup signature method
    signature_method = self.get_signature_method()

    if signature_method.verify(signature_base_string, self.consumer, self.token, self.signature):
      return self.consumer, self.token, self.oauth_parameters
    else:
      return None

  def __check_version(self):
    version = self.oauth_parameters.get('oauth_version', VERSION)
    if version != VERSION:
      raise OAuthError("only oauth v1.0 is supported at this time, and this request claims verions %s" % version)

  def __check_timestamp(self):
    timestamp = int(self.oauth_parameters.get('oauth_timestamp', '0'))
    now = int(time.time())

    lapsed = now - timestamp

    if lapsed > TIMESTAMP_THRESHOLD:
      raise OAuthError('Expired timestamp: given %d and now %s has a greater difference than threshold %d' % (timestamp, now, TIMESTAMP_THRESHOLD))
    
  def __check_nonce(self, nonce_store):
    nonce_str = self.oauth_parameters.get('oauth_nonce', None)

    if not nonce_str:
      raise OAuthError("no nonce")

    # this will throw an error if the nonce has been used before
    nonce_store.check_and_store_nonce(nonce_str)
  
  def get_signature_base_string(self):
    """
    Generate the signature base string, the string that is to be signed.
    """
    normalized_method = normalize_http_method(self.http_request.method)
    normalized_path = normalize_http_url(self.http_request.path)

    # parameters are both the oauth parameters and the data
    all_params = copy.copy(self.data)
    all_params.update(self.oauth_parameters)
    normalized_parameters = normalize_parameters(all_params)

    # join and escape
    sbs = '&'.join([escape(part) for part in [normalized_method, normalized_path, normalized_parameters]])

    logging.debug("sbs: %s" % sbs)
    return sbs

  def get_signature_method(self):
    """
    look up the signature method object
    """
    oauth_sig_method = self.oauth_parameters.get('oauth_signature_method',None)
    if not oauth_sig_method:
      return None
    else:
      return SIGNATURE_METHODS[oauth_sig_method]

  @staticmethod
  def from_http_request(http_request, oauth_store):
    """
    Given an incoming HTTP request, construct the OAuthRequest data structure from it.
    
    The second argument, oauth_store, is used for looking up the consumer and token.

    IMPORTANT: the result OAuthRequest is NOT YET verified
    """

    oauth_params = None

    # headers
    headers = http_request.headers

    auth_header = None
    if headers.has_key('Authorization'):
      auth_header = headers['Authorization']
    if headers.has_key('HTTP_AUTHORIZATION'):
      auth_header = headers['HTTP_AUTHORIZATION']

    if headers.has_key('HTTP_X_OAUTH_SBS'):
      logging.debug("client sbs: %s" % headers['HTTP_X_OAUTH_SBS'])

    # check that the authorization header is OAuth
    # SZ: dict . index raises error, should use find or handle by having a try block
    if auth_header and auth_header.find('OAuth') > -1:
      try:
        # get the parameters from the header
        oauth_params = parse_header(auth_header)
      except:
        raise OAuthError('Unable to parse OAuth parameters from Authorization header.')
    else:
      raise OAuthError("No OAuth authorization header.")

    if not oauth_params:
      raise OAuthError("Problem finding OAuth authorization information.")

    # we now have parameters, extract signature and store it separately
    if not oauth_params.has_key('oauth_signature'):
      raise OAuthError("No signature in oauth header.")
    
    signature = oauth_params['oauth_signature']
    del oauth_params['oauth_signature']

    # look up consumer
    if not oauth_params.has_key('oauth_consumer_key'):
      raise OAuthError("no consumer")
    oauth_consumer_key = oauth_params['oauth_consumer_key']
    consumer = oauth_store.lookup_consumer(oauth_consumer_key)
    if not consumer:
      raise OAuthError("No Consumer Found")

    # look up token
    token = None
    type = None

    # FIXME: we now treat a blank oauth_token as inexistent, but that's kinda shady.
    # Ben says: actually, that's how some oauth client libraries do it, so we have no choice.
    if oauth_params.has_key('oauth_token') and oauth_params['oauth_token'] != "":
      token_str = oauth_params['oauth_token']

      # first see if it's a request token
      token = oauth_store.lookup_request_token(consumer, token_str)

      # next, see if it's an access token
      if token:
        type = OAuthRequest.REQUEST_TOKEN
      else:
        token = oauth_store.lookup_access_token(consumer, token_str)
        if token:
          type = OAuthRequest.ACCESS_TOKEN
        else:
          # a token was present, but it was not found in the system, that's bad, throw an error
          raise OAuthError("a token was declared in the request but not found in the store")

    # create the request and manually set its oauth_parameters
    oauth_request = OAuthRequest(consumer, token, http_request, oauth_parameters = {})
    oauth_request.oauth_parameters = oauth_params
    oauth_request.token_type = type
    oauth_request.signature = signature

    return oauth_request


class OAuthServer(object):
  """
  The core OAuth logic
  """

  timestamp_threshold = 300 # in seconds, five minutes

  def __init__(self, store):
    self.store = store

  def __generate_request_token(self, consumer, oauth_callback, **kwargs):
    """
    do the actual request token generation for a consumer
    """

    # if oauth_callback is 'oob', then that's the null
    if oauth_callback == 'oob':
      oauth_callback = None

    # create a new request token and store it, added verifier for 1.0a
    token, secret, verifier = self.store.generate_request_token_secret_and_verifier(consumer)
    request_token = self.store.create_request_token(consumer, token, secret, verifier, oauth_callback, **kwargs)
    return request_token
  
  def generate_request_token(self, http_request, **kwargs):
    """
    Generate and store a request token as requested by the given http_request
    """
    # extract the oauth information
    oauth_request = OAuthRequest.from_http_request(http_request, self.store)

    if oauth_request.token != None:
      raise OAuthError("token mistakenly present in a request-token request")

    # oauth 1.0a requires a callback parameter
    if not oauth_request.oauth_parameters.has_key('oauth_callback'):
      raise OAuthError("an oauth_callback is required in oauth v1.0a, even if it's 'oob'")

    # verify it
    # pass the store in to check nonce
    if not oauth_request.verify(self.store):
      raise OAuthError("Authentication Failure")
    
    return self.__generate_request_token(oauth_request.consumer, oauth_request.oauth_parameters['oauth_callback'], **kwargs)

  def __authorize_request_token(self, request_token, **kwargs):
    self.store.authorize_request_token(request_token, **kwargs)

  def authorize_request_token(self, request_token_str, **kwargs):
    """
    Mark the request token as authorized.
    This is mostly a passthrough method
    """
    request_token = self.store.lookup_request_token(None, request_token_str)

    if not request_token:
      raise OAuthError("bad request token")

    # mark the request token authorized
    self.__authorize_request_token(request_token, **kwargs)

    return request_token

  def __exchange_request_token(self, consumer, request_token):
    """
    do the actual exchange of the request token based on full data structures
    """

    # mark request token used at this stage
    # only works if the request token has been authorized
    self.store.mark_request_token_used(consumer, request_token)

    # generate a new token
    token, secret = self.store.generate_access_token_and_secret(consumer, request_token)

    # we expect this call to check that, if the sharing action given by
    # this request token already exists, then the store will "do the right thing"
    # however, we still generate a new access token, because
    # we do not assume that it *can* be recovered, if it's self-certified.
    access_token = self.store.create_access_token(consumer, request_token, token, secret)

    return access_token

  def exchange_request_token(self, http_request):
    """
    Exchange the request token for an access token
    """
    # construct the oauth request data structure
    oauth_request = OAuthRequest.from_http_request(http_request, self.store)

    # we need a request token
    if oauth_request.token == None or oauth_request.token_type != OAuthRequest.REQUEST_TOKEN:
      raise OAuthError("no token or incorrect token present in a token-exchange")
      
    # verify it
    if not oauth_request.verify(self.store):
      raise OAuthError("Bad authentication")

    # ensure that the verifier is good
    if not oauth_request.oauth_parameters.has_key('oauth_verifier'):
      raise OAuthError("no request token verifier")

    if not self.store.verify_request_token_verifier(oauth_request.token, oauth_request.oauth_parameters['oauth_verifier']):
      raise OAuthError("bad request token verifier")

    access_token = self.__exchange_request_token(oauth_request.consumer, oauth_request.token)

    return access_token

  def generate_and_preauthorize_access_token(self, consumer, **kwargs):
    """
    Prepares a pre-authorized access token
    for this consumer and user.

    For simplicity, this is done via the normal path and fully simulated,
    so as not to make any assumptions about what's going on in the backend
    """
    
    # generate the request token
    request_token = self.__generate_request_token(consumer, 'oob')

    # approve it with the extra args given
    self.__authorize_request_token(request_token, **kwargs)

    # exchange for the access token
    access_token = self.__exchange_request_token(consumer, request_token)

    return access_token
    
    
  def check_resource_access(self, http_request):
    """
    Check that this is a properly formed oauth resource access request
    returns the consumer, token, and all oauth parameters

    A token is not required here, this could be a 2-legged request.
    """
    # construct the oauth request data structure
    oauth_request = OAuthRequest.from_http_request(http_request, self.store)

    # we need an access token
    #
    # REMOVED 2009-05-12: we actually want this to authenticate with the tokken
    # being the request token, access control is now done separately
    #
    #if oauth_request.token and oauth_request.token_type != OAuthRequest.ACCESS_TOKEN:
    #  raise OAuthError("incorrect token present in a resource-access call")
    
    # verify it
    if not oauth_request.verify(self.store):
      raise OAuthError("bad authentication")

    # grant access
    return oauth_request.consumer, oauth_request.token, oauth_request.oauth_parameters


# OAuthClient is a worker to attempt to execute a request
# FIXME: redo this OauthClient
class OAuthClient(object):
  consumer = None
  token = None

  def __init__(self, consumer, token=None, server_params=None):
    """
    server_params is a dictionary including request_token_url, authorize_url, access_token_url
    """
    self.consumer = consumer
    self.token = token
    self.server_params = server_params

  def get_consumer(self):
    return self.consumer

  def get_token(self):
    return self.token
  
  def set_token(self, token):
    self.token = token

  def fetch_request_token(self):
    http_request = HTTPRequest('POST', self.server_params['request_token_url'], data = None)
    return OAuthToken.from_string(self.access_resource(http_request))

  def get_authorize_url(self, request_token):
    return "%s?oauth_token=%s" % (self.server_params['authorize_url'], request_token.token)

  def fetch_access_token(self, request_token, verifier=None):
    data = None
    if verifier:
      data = urllib.urlencode({'oauth_verifier' : verifier})
    
    self.set_token(request_token)
    http_request = HTTPRequest('POST', self.server_params['access_token_url'], data = data)
    token = OAuthToken.from_string(self.access_resource(http_request))
    self.set_token(token)

    return token

  def access_resource(self, http_request, with_content_type=False):
    """
    host is a dictionary containing protocol, hostname, and port
    if port is not specified, it is assumed to be 80 for http, and 443 for https
    """
    # prepare the oauth request
    oauth_request = OAuthRequest(self.consumer, self.token, http_request)
    oauth_request.sign()
    header = oauth_request.to_header(with_content_type=with_content_type)

    # print header

    # connect and make the request
    url = http_request.path
    data = None

    # print "url: %s" % url
    if http_request.method == "GET":
      url += "?" + (http_request.data or "")
    else:
      data = http_request.data or {}
      
    request = urllib2.Request(url, data, header)
    return urllib2.urlopen(request).read()



class OAuthStore(object):
  def __init__(self):
    pass

  def generate_request_token_verifier(self, token, secret):
    """
    A verifier could be an HMAC of the token, or it could be a new random string
    """
    return generate_random_string()

  def verify_request_token_verifier(self, request_token, verifier):
    """
    Verify whether a request token's verifier matches
    """
    raise NotImplementedError("verify request token verifier needs to be implemented by store")

  def generate_request_token_secret_and_verifier(self, consumer):
    """
    By default, just random strings.
    But a more complex store could choose to build self-certifying tokens
    """
    token, secret = generate_token_and_secret()
    return token, secret, self.generate_request_token_verifier(token, secret)

  def generate_access_token_and_secret(self, consumer, request_token):
    """
    By default, just random string. Same as request_token,
    except here the self-certification might need to be based on all the properties of the request token,
    e.g. the permissions granted to this access_token, etc...
    """
    return generate_token_and_secret()

  def lookup_consumer(self, consumer_key):
    """
    returns on OAuthConsumer
    """
    raise NotImplementedError

  def create_request_token(self, consumer, request_token_str, request_token_secret, verifier, oauth_callback, **kwargs):
    """
    take a RequestToken and store it.

    kwargs is a set of custom extra arguments that are passed through from the controller to the store,
    e.g. a record_id if an app wants access to a specific record.
    """
    raise NotImplementedError

  def lookup_request_token(self, consumer, request_token_str):
    """
    token is the token string
    returns a OAuthRequestToken

    consumer may be null.
    """
    raise NotImplementedError

  def authorize_request_token(self, request_token, **kwargs):
    """
    Mark a request token as authorized by the given user,
    with the given additional parameters, which should probably include
    some information about which user this is.
    """
    raise NotImplementedError

  def mark_request_token_used(self, consumer, request_token):
    """
    Mark that this request token has been used.
    Should fail if it is already used
    """
    raise NotImplementedError

  def lookup_existing_access_token(self, consumer, request_token):
    """
    Check if there is already an access token for this consumer and
    the properties of this request_token
    """
    return None

  def create_access_token(self, consumer, request_token, access_token_str, access_token_secret):
    """
    Store the newly created access token that is the exchanged version of this
    request token.
    
    IMPORTANT: does not need to check that the request token is still valid, 
    as the library will ensure that this method is never called twice on the same request token,
    as long as mark_request_token_used appropriately throws an error the second time it's called.
    """
    raise NotImplementedError

  def lookup_access_token(self, consumer, access_token_str):
    """
    token is the token string
    returns a OAuthAccessToken
    """
    raise NotImplementedError

  def check_and_store_nonce(self, nonce_str):
    """
    store the given nonce in some form to check for later duplicates
    
    IMPORTANT: raises an exception if the nonce has already been stored
    """
    raise NotImplementedError


##
## Utility Functions
## 

# Generic exception class
class OAuthError(RuntimeError):
  def __init__(self, message='OAuth error occured.'):
    self.message = message

# optional WWW-Authenticate header (401 error)
def build_authenticate_header(realm=''):
  return {'WWW-Authenticate': 'OAuth realm="%s"' % realm}

# url escape
def escape(s):
  # escape '/' too
  return urllib.quote(s, safe='~')

# parse a query string
def parse_qs(qs):
  data = cgi.parse_qs(qs, keep_blank_values = True)
  for k in data.keys():
    if len(data[k]) == 1:
      data[k] = data[k][0]
  return data

def generate_random_string(length=20):
  # FIXME: better randomness
  return "".join([random.choice(string.printable[0:62]) for i in range(length)])  

# util: generate random token and secret
def generate_token_and_secret():
  return generate_random_string(), generate_random_string()

# util function: current timestamp
# seconds since epoch (UTC)
def generate_timestamp():
  return int(time.time())

# util function: nonce
# pseudorandom number
def generate_nonce(length=20):
  # FIXME: make this a stronger PRG
  return generate_random_string()

def normalize_parameters(params):
  """
  take a dictionary of parameters and normalize it to
  proper form for OAuth signatures and such.
  """
  key_values = params.items()
  # sort lexicographically, first after key, then after value
  key_values.sort()
  # combine key value pairs in string and escape
  return '&'.join('%s=%s' % (escape(str(k)), escape(str(v))) for k, v in key_values)

def normalize_http_method(method):
  """
  normalize an HTTP method (uppercase)
  """
  return method.upper()

def normalize_http_url(url):
  """
  normalize an HTTP URL for oauth signing
  """

  # We remove the webcal:// part because otherwise we can't compare it 
  # to the requested URL (Django doesn't handle that in request object)
  parts = urlparse.urlparse(url.replace('webcal://', 'http://'))
  if parts[0] and parts[1]:
    url_string = '%s://%s%s' % (parts[0], parts[1], parts[2]) # scheme, netloc, path
  else:
    # support of relative URLs (useful for tests)
    url_string = parts[2]
  return url_string
  
def parse_header(header):
  """
  split an oauth header into a dictionary
  """
  params = {}
  
  # remove the first "OAuth "
  header_without_oauth_prefix = header[6:]
  
  parts = header_without_oauth_prefix.split(',')
  for param in parts:
    # remove whitespace
    param = param.strip()

    # split key-value
    param_parts = param.split('=', 1)

    # remove quotes and unescape the value, but only if it's not realm
    if param_parts[0] == 'realm':
      continue

    params[param_parts[0]] = urllib.unquote(param_parts[1].strip('\"'))

  return params
