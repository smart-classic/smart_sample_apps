import RDF

rdf = RDF.NS('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
rdfs = RDF.NS('http://www.w3.org/2000/01/rdf-schema#')
owl = RDF.NS('http://www.w3.org/2002/07/owl#')
sp = RDF.NS('http://smartplatforms.org/terms#')
api = RDF.NS('http://smartplatforms.org/api/')
foaf = RDF.NS("http://xmlns.com/foaf/0.1/")
NS = {"sp":sp, "rdf":rdf, "rdfs":rdfs, "owl":owl, "api":api, "foaf": foaf}

anyuri = RDF.Node(uri_string="http://www.w3.org/2001/XMLSchema#anyURI")

# metaclass to allow class-based dictionary look-up
class LookupType(type):
    def __getitem__(self, key):
        return self.__getitem__(key)

serializer = RDF.RDFXMLSerializer()
for k in NS.keys():
    v = NS[k]
    serializer.set_namespace(k, RDF.Uri(v._prefix))

def serialize_rdf(model):
    return serializer.serialize_model_to_string(model)

def parse_rdf(string, model=None, context="none"):
    if model == None:
        model = RDF.Model() 
    parser = RDF.Parser()
    parser.parse_string_into_model(model, string.encode(), context)
    return model

def get_property(model, s, p, raw_statement=False):
    r = model.find_statements(
            RDF.Statement(
                s, 
                p,
                None))

    if (raw_statement): return r
    r = list(r)
    assert len(r) <= 1, "Expect at most one %s on subject %s; got %s"%(p, s, len(r))

    
    if len(r) == 0: return None

    node = r[0].object

    if (node.is_resource()):
        return node.uri
    elif (node.is_blank()):
        return node.blank_identifier
    else: #(node.is_literal()):
        return node.literal_value['string']

def remap_node(model, old_node, new_node=None):
    if (new_node == None):
        new_node = RDF.Node(uri_string="http://reified_node_" + old_node.blank_identifier)
    for s in list(model.find_statements(RDF.Statement(old_node, None, None))):
        del model[s]
        model.append(RDF.Statement(new_node, s.predicate, s.object))
    for s in list(model.find_statements(RDF.Statement(None, None, old_node))):
        del model[s]
        model.append(RDF.Statement(s.subject, s.predicate, new_node))            
    return
