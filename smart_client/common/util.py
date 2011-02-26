import rdflib
from rdflib import Namespace, URIRef, Literal, BNode
from StringIO import StringIO as sIO


rdflib.plugin.register('sparql', rdflib.query.Processor,
                       'rdfextras.sparql.processor', 'Processor')

rdflib.plugin.register('sparql', rdflib.query.Result,
                       'rdfextras.sparql.query', 'SPARQLQueryResult')

rdf = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
rdfs = Namespace('http://www.w3.org/2000/01/rdf-schema#')
owl = Namespace('http://www.w3.org/2002/07/owl#')
sp = Namespace('http://smartplatforms.org/terms#')
api = Namespace('http://smartplatforms.org/api/')
foaf = Namespace("http://xmlns.com/foaf/0.1/")

NS = {"sp":sp, "rdf":rdf, "rdfs":rdfs, "owl":owl, "api":api, "foaf": foaf}

anyuri = URIRef("http://www.w3.org/2001/XMLSchema#anyURI")

# metaclass to allow class-based dictionary look-up
class LookupType(type):
    def __getitem__(self, key):
        return self.__getitem__(key)

def serialize_rdf(model):
    return model.serialize(format="pretty-xml")

def parse_rdf(string, model=None, context="none"):
    if model == None:
        model = bound_graph() 
    model.parse(sIO(string))
    return model

def get_property(model, s, p, raw_statement=False):
    r = model.triples((s, p, None))
    if (raw_statement): return r

    r = list(r)
    assert len(r) <= 1, "Expect at most one %s on subject %s; got %s"%(p, s, len(r))    
    if len(r) == 0: return None

    return rdfO(r[0])

def remap_node(model, old_node, new_node=None):
    if (new_node == None):
        new_node = URIRef("http://reified_node_" + str(old_node))

    for s in list(model.triples((old_node, None, None))):
        model.remove(s)
        s = (new_node, s[1], s[2])
        model.add(s)

    for s in list(model.triples((None, None, old_node))):
        model.remove(s)
        s = (s[0], s[1], new_node)
        model.add(s)
    return


def bound_graph():
    g = rdflib.Graph()
    for p,v in default_ns.iteritems():
        g.bind(p,v)
    return g

def rdfS(s):
    return s[0];
def rdfP(s):
    return s[1];
def rdfO(s):
    return s[2];

default_ns = {}
default_ns['dc'] = Namespace('http://purl.org/dc/elements/1.1/')
default_ns['dcterms'] = Namespace('http://purl.org/dc/terms/')
default_ns['umls'] = Namespace('http://www.nlm.nih.gov/research/umls/')
default_ns['sp'] = Namespace('http://smartplatforms.org/terms#')
default_ns['foaf']=Namespace('http://xmlns.com/foaf/0.1/')
default_ns['rdf'] = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
default_ns['rdfs'] = Namespace('http://www.w3.org/2000/01/rdf-schema#')
default_ns['owl'] = Namespace('http://www.w3.org/2002/07/owl#')
default_ns['api'] = Namespace('http://smartplatforms.org/api/')
default_ns['rxn'] = Namespace('http://link.informatics.stonybrook.edu/rxnorm/')
default_ns['rxcui'] = Namespace('http://link.informatics.stonybrook.edu/rxnorm/RXCUI/')
default_ns['rxaui'] = Namespace('http://link.informatics.stonybrook.edu/rxnorm/RXAUI/')
default_ns['rxatn'] = Namespace('http://link.informatics.stonybrook.edu/rxnorm/RXATN#')
default_ns['rxrel'] = Namespace('http://link.informatics.stonybrook.edu/rxnorm/REL#')
default_ns['snomed-ct'] = Namespace('http://www.ihtsdo.org/snomed-ct/')
default_ns['ccr'] = Namespace('urn:astm-org:CCR')
default_ns['v'] = Namespace('http://www.w3.org/2006/vcard/ns#')

