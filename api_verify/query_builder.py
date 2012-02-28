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
    #if (rdf_ontology.sp.Code in [x.uri for x in t.parents]):
    #    name += " [code]" 
    res[name] = {}

    if t.equivalent_classes:
        ec = filter(lambda x: x.one_of, t.equivalent_classes)
        res[name]["oneOf"] = []
        for member in [x for c in ec for x in c.one_of]:
            identifier = split_uri(member.uri)
            system = str(member.uri).split(identifier)[0]
            spcode = split_uri(str(t.uri))
            res[name]["oneOf"].append("""<spcode:%s rdf:about="%s">
    <rdf:type rdf:resource="http://smartplatforms.org/terms#Code" /> 
    <dcterms:title>%s</dcterms:title>
    <sp:system>%s</sp:system>
    <dcterms:identifier>%s</dcterms:identifier> 
</spcode:%s>"""%(spcode, str(member.uri), member.title, system, identifier, spcode))
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

            if c.cardinality_string in ["1","1 - Many"]:
                prop = {"name":type_name_string(c), "type": target}
                if len(constraints) > 0: prop["constraints"] = constraints
                res[name]["properties"].append(prop)
      
def generate_sparql (res, target, id = 0):
    out = ""
    myid = "?s" + str(id)

    if str(target) not in (str(NS['rdfs']['Literal']), str(NS['xsd']['dateTime']), str(anyuri)):
        out += " " * 8
        out += " ".join((myid, "<" + str(NS['rdf']['type']) + ">", "<" + target + ">", ".\n"))
        if "properties" in res[target].keys():
            for p in res[target]["properties"]:
                if p["name"] != str(NS['sp']['belongsTo']):
                    id += 1
                    out += " " * 8
                    out += " ".join((myid, "<" + p["name"] + ">", "?s" + str(id), ".\n"))
                    if "constraints" not in p.keys():
                        id, out2 = generate_sparql (res, str(p["type"]), id)
                        out += out2
                
    return id, out
    
main_types = []
loaded = False
res = {}
        
def get_query (model):
    global loaded
    if not loaded:
        for t in rdf_ontology.api_types:
            if t.is_statement or len(t.calls) > 0:
                main_types.append(t)
            elif (rdf_ontology.sp.Component in [x.uri for x in t.parents]):
                main_types.append(t)

        for t in main_types: 
            generate_data_for_type(t, res)
            
        loaded = True

    id, q = generate_sparql (res, str(NS['sp'][model]))
    return "    ASK {\n" + q + "    }"
