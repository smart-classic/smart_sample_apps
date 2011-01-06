from query_builder import QueryBuilder
from util import *

class OwlAttr(object):
    def __init__(self, name, predicate, object=anyuri, max_cardinality=1, min_cardinality=0):
        self.name = name
        self.predicate = predicate
        self.object = object
        self.min_cardinality=min_cardinality
        self.max_cardinality=max_cardinality

class OwlObject(object):
    attributes = []
    def __init__(self, model, node):
        self.model = model
        self.node = node
        
    def __repr__(self):
        return "("+", ".join(["%s:%s"%(a.name, getattr(self, a.name)) for a in self.attributes])+")"
    
class SMArtOwlObject(OwlObject):
    __metaclass__ = LookupType
    store = {}

    def __init__(self, model, node):
        super(SMArtOwlObject, self).__init__(model, node)
        for a in self.attributes:
            try: 
                v =  [x.object for x in model.find_statements(RDF.Statement(node, a.predicate, None))]
                if a.max_cardinality==1: 
                    assert len(v) < 2, "Attribute %s has max cardinality 1, but length %s"%(a.name, len(v))
                    if len(v) == 1: v = v[0]
                    else: v = None
                setattr(self, a.name, v) 
            except: setattr(self, a.name, None)
        return
    
    @classmethod
    def get_or_create(cls, model, node, *args, **kwargs):
        if cls.store.has_key(node): return cls.store[node]
        n = cls(model, node, *args, **kwargs)
        cls.store[node] = n
        return n

    @classmethod
    def find_all(cls, m, *args, **kwargs):
        def get_nodes(m):
            q = RDF.Statement(None, rdf['type'], cls.rdf_type)
            r = list(m.find_statements(q))
            return r

        for n in get_nodes(m):
            cls.get_or_create(m, n.subject, *args, **kwargs)
        return cls.store.values()
    
    @classmethod
    def __getitem__(cls, key):
        try: return cls.store[key]
        except: return cls.store[RDF.Node(uri_string=key.encode())]
            
"""Represent calls like GET /records/{rid}/medications/"""
class SMArtCall(SMArtOwlObject):
    rdf_type = api['call']
    store = {}
    attributes =  [OwlAttr("target", api['target']),
              OwlAttr("above", api['above']),
              OwlAttr("description", api['description']),
              OwlAttr("path", api['path']),
              OwlAttr("method", api['method']),
              OwlAttr("by_internal_id", api['by_internal_id']),
              OwlAttr("category", api['category'])]

class SMArtDocs(SMArtOwlObject):
    attributes =  [OwlAttr("name", api['name']),
                   OwlAttr("description", api['description'])]


class SMArtRestriction(SMArtOwlObject):
    attributes =  [OwlAttr("property", owl['onProperty']),
                   OwlAttr("on_class", owl['onClass']),
                   OwlAttr("min_cardinality", owl['minCardinality']),
                   OwlAttr("all_values_from", owl['allValuesFrom']),
                   OwlAttr("doc", api['doc']),
                   OwlAttr("type", rdf['type'])]

    def __init__(self, model, node):
        super(SMArtRestriction, self).__init__(model, node)
        self.doc = SMArtDocs(model, self.doc)
  
"""Represent types like sp:Medication"""
class SMArtType(SMArtOwlObject):
    rdf_type = owl['Class']
    attributes =  [OwlAttr("example", api['example']),
                   OwlAttr("name", api['name']),
                   OwlAttr("name_plural", api['name_plural']),
                   OwlAttr("description", api['description']),
                   OwlAttr("base_path", api['base_path']),
                   OwlAttr("supers_classes", rdfs['subClassOf'], max_cardinality=0)]        
    
    store = {}
    def __init__(self, model, node, calls):
        super(SMArtType, self).__init__(model, node)
    
        self.restrictions = []
        self.parents = []
        for s in self.supers_classes:
            r = SMArtRestriction(model, s)
            if (r.type == owl['Restriction']):
                self.restrictions.append(r)
            else:
                r = SMArtType.get_or_create(model, s, calls)
                self.parents.append(r)

        self.calls = filter(lambda c:  c.target == self.node, calls)
        self.contained_types = {}
        self.properties = []
 
        # Add properties and contained types based on our own restrictions.       
        for p in self.parents:
            self.restrictions.extend(p.restrictions)

        for r in self.restrictions:
            if r.on_class:
                self.contained_types[r.property] = SMArtType.get_or_create(model, r.on_class, calls)
            else:
                self.properties.append(r)
        
        # And then pull in any from our parents.

    def predicate_for_contained_type(self, contained_type):
        for p, c in self.contained_types.iteritems():
            if c == contained_type: return p
        return None

    def __repr__(self):
        return "SMArtType:" + str(self.node)

    def query_one(self, id):
        return self.query(one_name=id)

    def query_all(self, above_type=None, above_uri=None):
        return self.query(above_type=above_type, above_uri=above_uri)

    def query(self, one_name="?root_subject", above_type=None, above_uri=None):
        ret = """
        BASE <http://smartplatforms.org/>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        CONSTRUCT { $construct_triples }
        FROM $context
        WHERE {
           { $query_triples } 
        }
        """

        q = QueryBuilder(self, one_name)
        
        if (above_type and above_uri):
            q.require_above(above_type, above_uri)
        b = q.build()

        ret = ret.replace("$construct_triples", q.construct_triples())
        ret = ret.replace("$query_triples", b)        
        return ret
                 
parsed = False
                
def parse_ontology(f):
    m = RDF.Model()
    p = RDF.Parser()
    p.parse_string_into_model(m, f, "nodefault")
    
    global api_calls 
    global api_types
    global parsed
    
    api_calls = SMArtCall.find_all(m)  
    api_types = SMArtType.find_all(m, api_calls)
    parsed = True
    
api_calls = None  
api_types = None 
ontology = SMArtType

try:
    from django.conf import settings
    f = open(settings.ONTOLOGY_FILE).read()
    parse_ontology(f)
except ImportError, AttributeError: pass

