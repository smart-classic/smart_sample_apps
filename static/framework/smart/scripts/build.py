import re

from smart_client.common.rdf_tools import rdf_ontology

X_MAP = [("record_id","this.record.id"),
         ("user_id","this.user.id"),
         ("smart_app_id","this.manifest.id")]

FORMATS = {"Alert": None,
           "User": None,
           "UserPreferences": None,
           "AppManifest": "JSON",
           "Container": "JSON",
           "ContainerManifest": "JSON",
           "default": "RDF"}
           
CONTENT_TYPES = {"RDF": "application/rdf+xml",
                 "JSON": "application/json"}

def get_calls():
    f = open('../../../../smart_client/common/schema/smart.owl').read()
    rdf_ontology.parse_ontology(f)

    out = []

    for t in rdf_ontology.api_calls:
        path = str(t.path)
        method = str(t.method)
        target = str(t.target).replace("http://smartplatforms.org/terms#","")
        category = str(t.category)
        by_internal_id = str(t.by_internal_id) == "true"

        if path not in ["/apps/{descriptor}/manifest",
        "/records/search?given_name={given_name}&family_name={family_name}&zipcode={zipcode}&birthday={birthday}&gender={gender}&medical_record_number={medical_record_number}",
        "/users/search?given_name={given_name}&family_name={family_name}"]:
            out.append({"path": path, "method": method, "category": category, "target": target, "by_internal_id": by_internal_id})

    return out
           
def plural (s):
    if s.endswith("s"):
        return s
    elif s.endswith("y"):
        return rreplace(s, 'y', 'ies', 1)
    else:
        return s + "s"
        
def singular (s):
    if s.endswith("ies"):
        return rreplace(s, 'ies', 'y', 1)
    elif s.endswith("s"):
        return rreplace(s, 's', '', 1)
    else:
        return s
        
def rreplace(s, old, new, occurrence):
    li = s.rsplit(old, occurrence)
    return new.join(li)

def call_name (path, method, category):
    terms = path.strip("/").split("/")
    terms = [t for t in terms if t.find("{") == -1]
    item = terms[-1]
    
    c = category.split("_")
    c = c[-1]
    
    if c.endswith("s") and path != "/manifest":
        name = plural(item)
    else:
        name = singular(item)
        
    return "_".join((name.upper(),method.lower()))
    
def js_format (path, external_id=False):
    for m in X_MAP:
        path = path.replace('{%s}'%m[0], '"+%s+"'%m[1])
       
    p = re.compile("{.*?}")
    vars = [s[1:-1] for s in p.findall(path)]
    
    for m in vars:
        path = path.replace("{%s}"%m, '"+%s+"'%m)

    return path, vars
    
def get_format (target):
    if target in FORMATS:
        return FORMATS[target]
    else:
        return FORMATS["default"]

def buildJS (call, path, vars, format, method, target, category):

    contentType = "undefined"
    data = "undefined"
    responseFormat="undefined"
 
    if method.upper() in ("PUT", "POST"):
        if format:
            responseFormat = format

        if format and CONTENT_TYPES[format]: 
            contentType = '"%s"'%CONTENT_TYPES[format]
        else:
            vars = ["content_type"] + vars
            contentType = "content_type"
            
        vars = ["data"] + vars
        data = "data"

    vars = vars + ["callback_success", "callback_error"]

    out = """SMART_CONNECT_CLIENT.prototype.%s = function(%s) {

        return this.api_call_wrapper({
            method: "%s",
            path: "%s",
            responseFormat: "%s",
            success: callback_success,
            failure: callback_error,
            data: %s,
            contentType: %s
        });

   }"""%(  call, 
            ", ".join(vars),
            method.upper(),
            path,
            format,
            data,
            contentType
        ) 

    out += """
    
    SMART_CONNECT_CLIENT.prototype.register_method(
      "%s",
      "%s", 
      "http://smartplatforms.org/terms#%s",
      "%s");""" % (call, method, target, category)
    
    return out
    
if __name__ == "__main__":

    f = open('smart-api-client-base.js').read()
    print f
    print

    res = get_calls()
    methods = {}
    
    
    for r in res:
        call = call_name(r["path"],r["method"],r["category"])
        path, vars = js_format(r["path"], not r["by_internal_id"])
        format = get_format(r["target"])

        methods[call] = buildJS (call, path, vars, format, r["method"], r["target"], r["category"])
        
    for m in sorted(methods.keys()):
        print methods[m]
        print

    print "SMART_CONNECT_CLIENT.prototype.MEDS_get = SMART_CONNECT_CLIENT.prototype.MEDICATIONS_get;\n"
    print "SMART_CONNECT_CLIENT.prototype.MEDS_get_all = SMART_CONNECT_CLIENT.prototype.MEDS_get;\n"
        
    print "SMART = new SMART_CONNECT_CLIENT(null, window.parent);"
