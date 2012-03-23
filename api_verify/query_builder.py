from settings import APP_PATH
from smart_client.common import rdf_ontology
from smart_client.common.util import NS, anyuri

def type_name_string(t):
    return str(t.uri)

def split_uri(t):
    try: 
        return str(t).rsplit("#",1)[1]
    except:
        try: 
            return str(t).rsplit("/",1)[1]
        except: 
            return ""
    
def generate_data_for_type(t, res):
    name = type_name_string(t)
    res[name] = {}
    
    #if (rdf_ontology.sp.Code in [x.uri for x in t.parents]):
    #    res[name]["type"]="code"

    if t.equivalent_classes:
        ec = filter(lambda x: x.one_of, t.equivalent_classes)
        res[name]["oneOf"] = []
        for member in [x for c in ec for x in c.one_of]:
            identifier = split_uri(member.uri)
            system = str(member.uri).split(identifier)[0]
            spcode = str(t.uri)
            data = {"code": spcode, "uri": str(member.uri), "title": member.title,
                    "system": system, "identifier": identifier}
            res[name]["oneOf"].append(data)  
    else:
        if len(t.object_properties) + len(t.data_properties) == 0:
            return

        res[name]["properties"] = []
        
        for c in sorted(t.object_properties + t.data_properties, key=lambda r: str(r.uri)):
            target = ""
            constraints = {}

            if type(c) is rdf_ontology.OWL_ObjectProperty:
                target = type_name_string(c.to_class)
                further = filter(lambda x: isinstance(x.all_values_from, rdf_ontology.OWL_Restriction), c.restrictions)
                for f in further:
                    p = str(f.all_values_from.on_property)
                    pc = f.all_values_from.all_values_from
                    pc = type_name_string(pc)
                    constraints[p] = pc

            elif type(c) is rdf_ontology.OWL_DataProperty:
                avf = filter(lambda x: x.all_values_from, c.restrictions)
                if len(avf) >0: d = avf[0].all_values_from.uri
                else: d = str(rdf_ontology.rdfs.Literal)
                target = d

            prop = {"name":type_name_string(c), "type": target, "cardinality": c.cardinality_string}
            if len(constraints) > 0: prop["constraints"] = constraints
            res[name]["properties"].append(prop)
                
def generate_constrained_sparql (res, target, type, constraints, queries = None, targets = None):

    if queries is None: queries = []
    if targets is None: targets = []

    constraint = constraints["http://smartplatforms.org/terms#code"]
    
#    print "constraint", constraint

    if "oneOf" in res[constraint].keys():
    
#        constraints_str = ""
#        first = True
     
#        for c in res[constraint]["oneOf"]:
#            if first:
#                first = False
#            else:
#                constraints_str += " ||\n"
#                
#            constraints_str += '''
#    (?uri = "%s" &&
#     ?code = "%s" &&
#     ?identifier = "%s" &&
#     ?title = "%s" &&
#     ?system = "%s")''' % (c['uri'], c['code'], c['identifier'], c['title'], c['system'])
    
        out = """PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dcterms:<http://purl.org/dc/terms/>
PREFIX sp:<http://smartplatforms.org/terms#>
PREFIX spcode:<http://smartplatforms.org/terms/codes/>
SELECT  ?uri ?code ?identifier ?title ?system
WHERE {
   ?a <%s> ?c .
   ?c rdf:type <%s> .
   ?c sp:code ?uri .
   ?uri rdf:type sp:Code .
   ?uri rdf:type ?code.
   ?uri dcterms:identifier ?identifier .
   ?uri dcterms:title ?title .
   ?uri sp:system ?system .
   FILTER (str(?code) != sp:Code) .
}""" % (target, type)

        queries.append({"type":"select", "query": out, "constraints": res[constraint]["oneOf"]})
        targets.append(target)
    
    return queries, targets
      
def generate_sparql (res, target, id = 0, depth = 1, queries = None, targets = None):

    if queries is None: queries = []
    if targets is None: targets = []

    #print target, len(queries), len(targets)

    out = ""
    myid = "?s" + str(id)

    if str(target) not in (str(NS['rdfs']['Literal']), str(NS['xsd']['dateTime']), str(anyuri)):
        out += " " * (4 * depth)
        out += " ".join((myid, "<" + str(NS['rdf']['type']) + ">", "<" + target + ">", ".\n"))
        if "properties" in res[target].keys() and target not in targets:
            targets.append(target)
            out2 = " " * 4
            out2 += " ".join((myid, "<" + str(NS['rdf']['type']) + ">", "<" + target + ">", ".\n"))
            out2 += " " * 4 + "OPTIONAL {\n"
            out4 = " " * 4 + "FILTER ( "
            first = True
            for p in res[target]["properties"]:
                if p["name"] != str(NS['sp']['belongsTo']):
                    if p["cardinality"] in ["1","1 - Many"]:
                        id += 1
                        out2 += " " * (4 * 2)
                        out2 += " ".join((myid, "<" + p["name"] + ">", "?s" + str(id), ".\n"))
                        if first:
                            first = False
                        else:
                            out4 += " || "
                        out4 += "!BOUND(?s" + str(id) + ")"
                        id, out3, queries, targets = generate_sparql (res, str(p["type"]), id, 2, queries, targets)
                        out2 += out3
                        if "constraints" in p.keys():
                            queries, targets = generate_constrained_sparql (res, str(p["name"]), str(p["type"]), p["constraints"], queries, targets)
                    else:
                        id += 1
                        id, out3, queries, targets = generate_sparql (res, str(p["type"]), id, 2, queries, targets)
                        if "constraints" in p.keys():
                            queries, targets = generate_constrained_sparql (res, str(p["name"]), str(p["type"]), p["constraints"], queries, targets)
            out4 += " )"
            out2 += " " * 4 + "}\n" + out4
            if not first:
                queries.append({"type":"negative", "query": "SELECT %s\nWHERE {\n%s\n}" % (myid, out2)})
                
    return id, out, queries, targets
    
main_types = []
loaded = False
res = {}
        
def get_queries (model):
    global loaded
    if not loaded:
        #print "NOT LOADED... PARSING"
        if not rdf_ontology.api_types:
            rdf_ontology.parse_ontology(open(APP_PATH + '/data/smart.owl').read())
    
        for t in rdf_ontology.api_types:
            if t.is_statement or len(t.calls) > 0:
                main_types.append(t)
            elif (rdf_ontology.sp.Component in [x.uri for x in t.parents]):
                main_types.append(t)

        for t in main_types: 
            generate_data_for_type(t, res)
            
        loaded = True
        
    #import json
    #print json.dumps(res[str(NS['sp'][model])], sort_keys=True, indent=4)

    #print "GENERATING QUERIES FOR", model
    a, b, queries, c = generate_sparql (res, str(NS['sp'][model]))#, 0, 1, [], [])
    
    #queries = []
    #queries.append({"type":"ASK", "query": "    ASK {\n" + q + "    }"})
    
    return queries

def get_query (model):
    r = get_queries (model)
    
    #for q in r:
    #    print q["query"]
    
    if len(r) == 0:
        return ""
    else:
        return r[0]["query"]