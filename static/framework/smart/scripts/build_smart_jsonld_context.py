import simplejson
from smart_client.common import rdf_ontology
import rdflib

f = open('../../../../../smart_server/smart/document_processing/schema/smart.owl').read()
rdf_ontology.parse_ontology(f)

seen = {}
context = {}
ns = rdf_ontology.SMART_Class["http://smartplatforms.org/terms#Statement"].graph.namespace_manager

def add_term(uri):
    if not isinstance(uri, rdflib.URIRef):
        return

    jname = ns.normalizeUri(uri)
    jname = jname.replace("sp:", "")
    jname = jname.replace(":", "_")
    jname = jname.replace("-","_")
    assert jname not in seen or seen[jname]==uri, "predicate appears in >1 vocab: %s, %s"%(uri, seen[jname])
    seen[jname] = uri
    context[jname] =  {"@id": str(uri)}
    return jname 

for c in rdf_ontology.SMART_Class.store.values():
    if not isinstance(c, rdf_ontology.SMART_Class):
        continue
    add_term(c.uri)

    for p in c.object_properties + c.data_properties:
        added = add_term(p.uri)
        if p.multiple_cardinality:
            context[added]["@container"] = "@set"

print simplejson.dumps(context, sort_keys=True, indent=4)
