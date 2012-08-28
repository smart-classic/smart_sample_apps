import sys
sys.path.append('../../../..')
import simplejson
from smart_client.common.rdf_tools import rdf_ontology
import rdflib

seen = {}
context = {}
ns = rdf_ontology.SMART_Class["http://smartplatforms.org/terms#Statement"].graph.namespace_manager

def add_term(uri):
    if not isinstance(uri, rdflib.URIRef):
        return

    jname = ns.normalizeUri(uri)
    jname = jname.replace("sp:", "")
    jname = jname.replace(":", "__")
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

# add ResponseSummary to context
context['ResponseSummary'] = {'@id': 'http://smartplatforms.org/terms/api#ResponseSummary'}
context['resultsReturned'] = {
    '@id':   'http://smartplatforms.org/terms/api#resultsReturned',
    '@type': 'xsd:integer'
}
context['totalResultCount'] = {
    '@id':   'http://smartplatforms.org/terms/api#totalResultCount',
    '@type': 'xsd:integer'
}
context['processingTimeMs'] = {
    '@id':   'http://smartplatforms.org/terms/api#processingTimeMs',
    '@type': 'xsd:integer'
}

print "SMART.jsonld_context = " + simplejson.dumps(context, sort_keys=True, indent=4)
