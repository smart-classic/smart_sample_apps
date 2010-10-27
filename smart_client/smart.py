"""
Connect to the SMArt API
"""

import urllib, uuid
import httplib
from oauth import *
from rdf_utils import *
import time
import RDF
    
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
    
    @property
    def storage_endpoint(self):
        return "/app_storage/%s/"%self.app_id
    
    def post_rdf_store(self, graph):
        return self.post(self.storage_endpoint, serialize_rdf(graph), "application/rdf+xml")
    
    def delete_rdf_store(self, sparql):
        print "Endpoint: ", self.storage_endpoint
        return self.delete(self.storage_endpoint, urllib.urlencode({'SPARQL' : sparql}), "application/x-www-form-urlencoded")
        
    def get_rdf_store(self, sparql=None):
        data = None
        ct = "application/x-www-form-urlencoded"
        
        if sparql:
            data = urllib.urlencode({ "SPARQL": sparql })
        
        
        return self.get(self.storage_endpoint, data, ct)
        
    def get(self, url, data=None, content_type=None):
            req = None
            if (content_type):
                req = HTTPRequest('GET', '%s%s'%(self.baseURL, url), data=data)
            else:
                req = HTTPRequest('GET', '%s%s'%(self.baseURL, url), data=data)
                
            return self.access_resource(req)

    def post(self, url, data="", content_type="application/rdf+xml"):
            req = HTTPRequest('POST', '%s%s'%(self.baseURL, url), data=data, data_content_type=content_type)
            return self.access_resource(req,with_content_type=True)
        
    def put(self, url, data="", content_type="application/rdf+xml"):
            req = HTTPRequest('PUT', '%s%s'%(self.baseURL, url), data=data, data_content_type=content_type)
            return self.access_resource(req,with_content_type=True)

    def delete(self, url, data="", content_type="application/rdf+xml"):
            req = HTTPRequest('DELETE', '%s%s'%(self.baseURL, url), data=data, data_content_type=content_type)
            return self.access_resource(req,with_content_type=True)
        
    def post_med_ccr(self, record_id, data):
            return self.post("/med_store/records/%s/"%record_id, data, "application/xml" )


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

    def get_demographics(self):
        d = self.get("/records/%s/demographics"%self.record_id)
        print "d", d
        model = parse_rdf(d)

        ret = {}
        
        ret['givenName'] = get_property(model, None, NS['foaf']['givenName'])      
        ret['familyName'] = get_property(model, None, NS['foaf']['familyName'])      
        ret['gender'] = get_property(model, None, NS['foaf']['gender'])      
        ret['zipcode'] = get_property(model, None, NS['spdemo']['zipcode'])      
        ret['birthday'] = get_property(model, None, NS['spdemo']['birthday'])      
        return  ret


    def get_notes(self):
        n = self.get("/records/%s/notes/"%self.record_id)
        return parse_rdf(n)


    def put_ccr_to_smart(self, record_id, ccr_string):
        rdf_string  = xslt_ccr_to_rdf(ccr_string, self.stylesheet)
        model = parse_rdf(rdf_string)
        
        print "START PUTTING:  ", time.time()
        med_uris = get_medication_uris(model)

        for med_uri in med_uris:
            self.put_med_helper(model, med_uri, record_id)    
        
        print "MEDS DONE: ", time.time()
        med_count = {}
        for med_uri in med_uris:
            med_count[str(med_uri)] = 0
            for fill_uri in get_fill_uris(model, med_uri):
                med_count[str(med_uri)] += 1
                self.put_fill_helper(model, med_uri, fill_uri, record_id)
        print "FILLS DONE: ", time.time()
        
        total = 0
        print "Total fills: ", len(med_count.keys())
        
    def put_med_helper(self, g, med_uri, record_id):
        print "putting med", med_uri
        external_id = med_external_id(g, med_uri)
        med = get_medication_model(g, med_uri)
        self.smart_med_put(record_id, external_id, serialize_rdf(med))    
        
    def put_fill_helper(self, g, med_uri, fill_uri, record_id):
        ext_med = med_external_id(g, med_uri)
        ext_fill = fill_external_id(g, fill_uri)
        ext_fill = "%s_%s"%(ext_med, ext_fill)
        
        fill = get_fill_model(g, fill_uri)        
        
        self.smart_fill_put(record_id, ext_med, ext_fill, serialize_rdf(fill)) 

    def smart_med_put(self, record_id, external_id, data):
        try:
            if (self.saved_ids[record_id][external_id]): 
                print "Already existed."
                return
        except KeyError:
            if (record_id not in self.saved_ids):
                self.saved_ids[record_id] = {}
            print "Adding new."
            self.saved_ids[record_id][external_id]  = True
        
        return self.put("/records/%s/medications/external_id/%s"%(record_id, external_id), data, "application/rdf+xml")
    
    def smart_fill_put(self, record_id, med_external_id, fill_external_id, data):
        try:
            if (self.saved_ids[record_id][fill_external_id]): return
        except KeyError:           
            if (record_id not in self.saved_ids):
                self.saved_ids[record_id] = {}
            self.saved_ids[record_id][fill_external_id]  = True
        
        return self.put("/records/%s/medications/external_id/%s/fulfillments/external_id/%s"%(record_id, med_external_id, fill_external_id), 
                        data, "application/rdf+xml")

    def get_tokens_for_record(self, record_id, label="smart"):
        q = """CONSTRUCT {?s ?p ?o} 
                WHERE {?s ?p ?o
                   filter (?s = <http://smartplatforms.org/records/%s>)
                   }"""%record_id
    
        m = parse_rdf(self.get_rdf_store(q))
        rec = RDF.Node(uri_string="http://smartplatforms.org/records/%s"%record_id.encode())
        return self.extract_one_token(m, rec, label)

    def get_all_tokens(self,labels=[]):
        ret = {}

        for l in labels:
            q = """CONSTRUCT {?s ?p ?o} 
                WHERE {?s ?p ?o
                   filter (?p = <http://smartplatforms.org/%s_token> ||
                           ?p = <http://smartplatforms.org/%s_secret> )
                   }"""%(l, l)

            m = parse_rdf(self.get_rdf_store(q))
            
            for s in m.find_statements(RDF.Statement(
                None, 
                RDF.Node(uri_string="http://smartplatforms.org/%s_token"%l),
                None)):
                print "getting one token", str(s.subject.uri)

                record_id = str(s.subject.uri)

                one_token =self.extract_one_token(m, s.subject, l) 
                if one_token: 
                    if (record_id not in ret): ret[record_id] = {}
                    ret[record_id][l] = one_token

        return ret

    def extract_one_token(self, model, record, label="smart"):
        base = "http://smartplatforms.org/%s"
        targets = ['%s_token'%label, '%s_secret'%label]
        ret = {}
        try:
            for t in targets:
                ret[t] = get_property(model, record, RDF.Node(uri_string=base%t))
              
            return OAuthToken(token=ret['%s_token'%label], secret=ret['%s_secret'%label])

        except AssertionError: return None


    def delete_token(self, record_id, label="smart"):
        q = """
        CONSTRUCT { <http://smartplatforms.org/records/%s> ?p ?t.}
        WHERE { 
          <http://smartplatforms.org/records/%s> ?p ?t
        FILTER (
            ?p = <http://smartplatforms.org/%s_token> || 
            ?p = <http://smartplatforms.org/%s_secret>)
        }""" % (record_id, record_id, label, label)

        print "Deleting, ",q
        return self.delete_rdf_store(q)

    def save_token(self, record_id, access_token, label="smart"):
        self.delete_token(record_id, label)


        sp = RDF.NS("http://smartplatforms.org/")
        rec = sp["records/%s"%record_id.encode()]

        m = RDF.Model()
        m.append(RDF.Statement(
                rec, 
                sp["%s_token"%label],
                RDF.Node(access_token.token)
                ))

        m.append(RDF.Statement(
                rec, 
                sp["%s_secret"%label],
                RDF.Node(access_token.secret)
                ))

        self.post_rdf_store(m)


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