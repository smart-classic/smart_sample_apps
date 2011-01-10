"""
Connect to the SMArt API
"""

import urllib, uuid
import httplib
from oauth import *
import time
import generate_api
import common.rdf_ontology
import common.util

class SmartClient(OAuthClient):
    """Establishes OAuth communication with a SMArt Container, and
    provides access To the SMArt REST API"""  

    def __init__(self, app_id, server_params, consumer_token, resource_token=None):
        """Constructor for SmartClient. 

            app_id:  ID by which the app is known to the SMArt Container

            server_params: Hash containing an "api_base" key pointing
            to the SMArt Container's base URL.

                e.g. {"api_base" : "http://sandbox-api.smartplatforms.org"}
            
            consumer_token: Hash containing a "consumer_key" and
            "consumer_secret" to be used for two- and three-legged
            OAuth requests.

            resource_token (optional): Hash containing session
            "oauth_token" and "oauth_token_secret" to be used for
            three-legged OAuth requests.
            """

        
        consumer = OAuthConsumer(consumer_key = consumer_token['consumer_key'], 
                                 secret       = consumer_token['consumer_secret'])

        super(SmartClient, self).__init__(consumer = consumer);
        self.server_params = server_params
        if (resource_token):
            token = OAuthToken(token=resource_token['oauth_token'], secret=resource_token['oauth_token_secret'])
            self.set_token(token)

        self.baseURL = self.server_params['api_base']
        self.saved_ids = {}
        self.app_id = app_id
        self.stylesheet = None
        
        if (not common.rdf_ontology.parsed):
            print "unparsed."
            self.__class__.ontology_file = self.get("/ontology")
            common.rdf_ontology.parse_ontology(SmartClient.ontology_file)
            print "parsed onto", common.rdf_ontology.parsed
            generate_api.augment(self.__class__)
            
        print "Done init sc"

    def _access_resource(self, http_request, oauth_parameters = {}, with_content_type=False):
        """
        Internal function to access HTTP resources.  Developers should
        use get, delete, put, or post instead, as appropriate."""
        
        oauth_request = OAuthRequest(self.consumer, self.token, http_request, oauth_parameters=oauth_parameters)
        oauth_request.sign()        
        header = oauth_request.to_header(with_content_type=with_content_type)
    
        from urlparse import urlparse
        o = urlparse(http_request.path)

        if (o.scheme == "http"):
            conn = httplib.HTTPConnection("%s"%o.netloc)
        elif (o.scheme == "https"):
            conn = httplib.HTTPSConnection("%s"%o.netloc)
    
        data = None
        path = o.path
        if (http_request.method == "GET"):
            if (http_request.data):
                path +=  "?"+http_request.data
        else:
            data = http_request.data or {}
        conn.request(http_request.method, path, data, header)
        r = conn.getresponse()
        if (r.status == httplib.NOT_FOUND): raise Exception( "404")
        data = r.read()
        conn.close()
        return data
            
    def get(self, url, data=None, content_type=None):
            """Issue an HTTP GET request to the specified URL and
            return the response body.

                  data: a dictionary of data to be url-encoded, or a
                  string containing the HTTP request message body.

                  content_type:  defaults to "application/x-www-form-urlencoded"
            """

            req = None
            print url, data, content_type
            if isinstance(data, dict): data = urllib.urlencode(data)
            
            req = HTTPRequest('GET', '%s%s'%(self.baseURL, url), data=data)    
            return self._access_resource(req)

    def post(self, url, data="", content_type="application/rdf+xml"):
            """Issue an HTTP POST request to the specified URL and
            return the response body.

                  data: string containing HTTP request message body.

                  content_type:  defaults to "application/x-www-form-urlencoded"
            """
            req = HTTPRequest('POST', '%s%s'%(self.baseURL, url), data=data, data_content_type=content_type)
            return self._access_resource(req,with_content_type=True)
        
    def put(self, url, data="", content_type="application/rdf+xml"):
            """Issue an HTTP PUT request to the specified URL and
            return the response body.

                  data: string containing HTTP request message body.

                  content_type:  defaults to "application/x-www-form-urlencoded"
            """
            req = HTTPRequest('PUT', '%s%s'%(self.baseURL, url), data=data, data_content_type=content_type)
            return self._access_resource(req,with_content_type=True)

    def delete(self, url, data=None, content_type=None):
            """Issue an HTTP DELETE request to the specified URL and
            return the response body.
            """
            Req = HTTPRequest('DELETE', '%s%s'%(self.baseURL, url), data=data)
            return self._access_resource(req)

    def update_token(self, resource_token):
        """ Sets the session token for subsequent three-legged OAuth requests.

            resource_token: Hash containing session "oauth_token" and
            "oauth_token_secret" to be used for three-legged OAuth
            requests."""
   
        self.set_token(OAuthToken(token=resource_token.token, secret=resource_token.secret))
    
    def get_request_token(self, params={}):
        http_request = HTTPRequest('POST', self.server_params['request_token_url'], data = urllib.urlencode(params), data_content_type="application/x-www-form-urlencoded")

        return OAuthToken.from_string(self._access_resource(http_request, oauth_parameters={'oauth_callback': self.server_params['oauth_callback']}, with_content_type=True))
    
    def redirect_url(self, request_token):
        ret = "%s?oauth_token=%s" % (self.server_params['authorize_url'], request_token.token)
        return ret

    def exchange(self, request_token, verifier=None):
        req = HTTPRequest('GET', self.server_params['access_token_url'], data = None)
        token = OAuthToken.from_string(self._access_resource(req, oauth_parameters={'oauth_verifier' : verifier}))
        self.set_token(token)
        return token

    def loop_over_records(self):    
        """Iterator allowing background apps to loop through each
        patient record in the SMArt container, e.g. to perform
        reporting or analytics.  For each patient record in the
        container, sets access tokens on the SmartClient object and
        yields the new record_id."""

        r = self.post("/apps/%s/tokens/records/first"%self.app_id)
        
        while r:
            print r
            p = {}
            for pair in r.split('&'):
                (k, v) = [urllib.unquote_plus(x) for x in pair.split('=')] 
                p[k]=v
        
            record_id = p['smart_record_id']
        
            t = p['oauth_token']
            s = p['oauth_token_secret']

            self.set_token(OAuthToken(token=t, secret=s))
            self.record_id = record_id
            yield record_id
            self.set_token(None)
            self.record_id = None
            try:
                r = self.post("/apps/%s/tokens/records/%s/next"%(self.app_id, record_id))
            except:
                break
            
    def data_mapper(self, data):
        """Hook to parse the results of OAuth requests into a
        query-able RDF graph"""
        return common.util.parse_rdf(data)
