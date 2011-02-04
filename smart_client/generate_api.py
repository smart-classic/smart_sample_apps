"""
Generate all API methods from SMArt OWL ontology
"""

import os, re
import RDF
import common.rdf_ontology as rdf_ontology

pFormat = "{.*?}"

def parameter_optional(call, p):
    mark = call.path.find("?")
    point = call.path.find(p)
    return -1 < mark < point

def fill_url_template(call, *args, **kwargs):
    url =  str(call.path)
    url = url.split("?")[0]

    # Look for each param in kwargs.  
    for p in params(call):
        try:  
            v = kwargs[p]
            url = url.replace("{%s}"%p, v)
        except KeyError as e:
            # If not found:
            #    1.  Try to find it as a direct attribute of the SmartClient
            try: v = getattr(kwargs['_client'], p)
            except: 
                #    2.  See if it's optional (and thus can be skipped)
                if parameter_optional(call,p):
                    v = ""
                else: raise e
        url = url.replace("{%s}"%p, v)
    return url

def call_name(call):
    ret = str(call.path)
    ret = ret.split("?")[0]
    ret = ret.replace("/", "_")
    ret = re.sub(pFormat, "_X", ret)
    ret = ret + "_" + str(call.method)
    ret = re.sub("_+", "_", ret)
    ret = re.sub("^_", "", ret)
    return ret

def params(call):
    return [x[1:-1] for x in re.findall(pFormat, str(call.path))]

def make_generic_call(call):
    def c(self, *args, **kwargs):
        kwargs['_client'] = self
        url = fill_url_template(call, **kwargs)
        print "gencall: ", url
        data = kwargs.get('data', None) 
        content_type = kwargs.get('content_type', None)
        f = getattr(self, str(call.method).lower())          
        ret =  f(url=url, data=data, content_type=content_type)
        return self.data_mapper(ret)
    return c

def augment(client_class):
    for c in rdf_ontology.api_calls:
        call = make_generic_call(c)
        call.__doc__ = """%s %s

%s

Returns RDF Graph containing:  %s
     """%(c.method, c.path, c.description, c.target)
        setattr(client_class, call_name(c), call)
    print dir(client_class)
