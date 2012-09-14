import re
import json
from smart_client.common.rdf_tools import rdf_ontology

def buildJS (call):

    queryParams = { }

    if call.cardinality=="multiple":
        queryParams['limit']=None
        queryParams['offset']=None

    for p in call.parameters + call.filters:
        queryParams[p.client_parameter_name] = None

    out = """
        SMART_CONNECT_CLIENT.prototype.%(call_name)s = function(p) {
            return this.api_call_wrapper({
                parameters: p || {},
                method: "%(method)s",
                path: "%(path)s",
                queryParams: %(queryParams)s
            });
        };"""% {
           'call_name' : str(call.client_method_name),
           'method': str(call.http_method),
           'path': str(call.path),
           'queryParams': json.dumps(queryParams, indent=2)
        }   

    return out
    
if __name__ == "__main__":
    f = open('smart-api-client-base.js').read()
    print f + "\n"

    methods = {}
    for r in rdf_ontology.api_calls:
        methods[r.client_method_name] = buildJS(r)
        
    for m in sorted(methods.keys()):
        print methods[m]
        print

    print "SMART = new SMART_CONNECT_CLIENT(null, window.parent);"
