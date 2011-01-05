"""
Connect to the SMArt API
"""

import urllib, uuid
import httplib
from oauth import *
import time
import generate_api
from StringIO import StringIO
import common.rdf_ontology
import common.util
  
class SmartClient(OAuthClient):
    def __init__(self, app_id, server_params, consumer_token, resource_token=None):
        # create an oauth client
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

    def access_resource(self, http_request, oauth_parameters = {}, with_content_type=False):
        """
        host is a dictionary containing protocol, hostname, and port
        if port is not specified, it is assumed to be 80 for http, and 443 for https
        """
        # prepare the oauth request
        
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
            req = None
            print url, data, content_type
            if isinstance(data, dict): data = urllib.urlencode(data)
            
            req = HTTPRequest('GET', '%s%s'%(self.baseURL, url), data=data)    
            return self.access_resource(req)

    def post(self, url, data="", content_type="application/rdf+xml"):
            req = HTTPRequest('POST', '%s%s'%(self.baseURL, url), data=data, data_content_type=content_type)
            return self.access_resource(req,with_content_type=True)
        
    def put(self, url, data="", content_type="application/rdf+xml"):
            req = HTTPRequest('PUT', '%s%s'%(self.baseURL, url), data=data, data_content_type=content_type)
            return self.access_resource(req,with_content_type=True)

    def delete(self, url, data=None, content_type=None):
            req = HTTPRequest('DELETE', '%s%s'%(self.baseURL, url), data=data)
            return self.access_resource(req)

    def update_token(self, token):
        self.set_token(OAuthToken(token=token.token, secret = token.secret))
    
    def get_request_token(self, params={}):
        http_request = HTTPRequest('POST', self.server_params['request_token_url'], data = urllib.urlencode(params), data_content_type="application/x-www-form-urlencoded")

        return OAuthToken.from_string(self.access_resource(http_request, oauth_parameters={'oauth_callback': self.server_params['oauth_callback']}, with_content_type=True))
    
    def redirect_url(self, request_token):
        ret = "%s?oauth_token=%s" % (self.server_params['authorize_url'], request_token.token)
        return ret

    def exchange(self, request_token, verifier=None):
        """
        generate a random token, secret, and record_id
        """
        req = HTTPRequest('GET', self.server_params['access_token_url'], data = None)
        token = OAuthToken.from_string(self.access_resource(req, oauth_parameters={'oauth_verifier' : verifier}))
        self.set_token(token)
        return token

    def loop_over_records(self):    
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
        return common.util.parse_rdf(data)