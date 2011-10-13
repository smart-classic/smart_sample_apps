"""
RDF Parsing utils for SMArt
Josh Mandel
joshua.mandel@childrens.harvard.edu
"""

import urllib, rdflib
#import RDF
#import libxml2, libxslt
import datetime, time

from common import rdf_ontology

NS = {}
#NS['dc'] = RDF.NS('http://purl.org/dc/elements/1.1/')
#NS['dcterms'] = RDF.NS('http://purl.org/dc/terms/')
#NS['med'] = RDF.NS('http://smartplatforms.org/medication#')
#NS['umls'] = RDF.NS('http://www.nlm.nih.gov/research/umls/')
#NS['sp'] = RDF.NS('http://smartplatforms.org/')
#NS['spdemo'] = RDF.NS('http://smartplatforms.org/demographics/')
#NS['foaf']=RDF.NS('http://xmlns.com/foaf/0.1/')
#NS['rdf'] = RDF.NS('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
#NS['rxn'] = RDF.NS('http://link.informatics.stonybrook.edu/rxnorm/')
#NS['rxcui'] = RDF.NS('http://link.informatics.stonybrook.edu/rxnorm/RXCUI/')
#NS['rxaui'] = RDF.NS('http://link.informatics.stonybrook.edu/rxnorm/RXAUI/')
#NS['rxatn'] = RDF.NS('http://link.informatics.stonybrook.edu/rxnorm/RXATN#')
#NS['rxrel'] = RDF.NS('http://link.informatics.stonybrook.edu/rxnorm/REL#')
#NS['ccr'] = RDF.NS('urn:astm-org:CCR')

def serialize_rdf(model):
    serializer = bound_serializer()    
    try: return serializer.serialize_model_to_string(model)
    
    except AttributeError:
      try:
          tmpmodel = RDF.Model()
          tmpmodel.add_statements(model.as_stream())
          return serializer.serialize_model_to_string(tmpmodel)
      except AttributeError:
          return '<?xml version="1.0" encoding="UTF-8"?>'

def bound_serializer():
    s = RDF.RDFXMLSerializer()
    bind_ns(s)
    return s 

def bind_ns(serializer, ns=NS):
    for k in ns.keys():
        v = ns[k]
        serializer.set_namespace(k, RDF.Uri(v._prefix))

def parse_rdf(string, model=None, context="none"):
    if model == None:
        model = RDF.Model() 
    parser = RDF.Parser()
    try:
        parser.parse_string_into_model(model, string.encode(), context)
    except  RDF.RedlandError: pass
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

def get_medication_uris(g):
    qs = RDF.Statement(subject=None, 
                       predicate=NS['rdf']['type'], 
                       object=NS['sp']['medication'])
    
    ret = []
    for s in g.find_statements(qs):
        ret.append(s.subject)
        
    return ret

def get_medication_model(g,med_uri):
    properties = [NS['dcterms']['title'], 
                  NS['med']['drug'],
                  NS['med']['notes'],
                  NS['med']['strength'],
                  NS['med']['strengthUnit'],
                  NS['med']['dose'],
                  NS['med']['doseUnit'],
                  NS['med']['startDate'],
                  NS['med']['endDate'],
                  NS['rdf']['type']]
    
    one_med = RDF.Model()

    for p in properties:
        one_med.add_statements(get_property(g, med_uri, p, raw_statement=True))
            
    return one_med
             
def get_fill_uris(g, med_uri):
    parent_statement = RDF.Statement(subject=med_uri, 
                       predicate=NS['sp']['fulfillment'], 
                       object=None)
    
    ret = []
    for s in g.find_statements(parent_statement):
        ret.append(s.object)
    return ret

def get_fill_model(g,fill_uri):
    properties = [NS['sp']['pharmacy'],
                  NS['sp']['prescriber'],
                  NS['sp']['dispenseQuantity'],
                  NS['sp']['PBM'],
                  NS['dc']['date'],
                  NS['rdf']['type']]
    
    one_fill = RDF.Model()

    for p in properties:
        one_fill.add_statements(get_property(g, fill_uri, p, raw_statement=True))
            
    return one_fill

def med_external_id(g, med_uri):
    qs =  RDF.Statement(subject=med_uri, 
                       predicate=NS['med']['drug'], 
                       object=None)
    
    ret = None
    for s in g.find_statements(qs):
        return str(s.object.uri).split('/')[-1]
    
def fill_external_id(g, fill_uri):
    qs =  RDF.Statement(subject=fill_uri, 
                       predicate=NS['dc']['date'], 
                       object=None)
    
    ret = None
    for s in g.find_statements(qs):
        t = time.mktime(datetime.datetime.strptime(s.object.literal_value['string'], 
                                                   "%Y-%m-%dT%H:%M:%SZ").timetuple())
        return str(int(t))

def xslt_ccr_to_rdf(source, stylesheet):
    sourceDOM = libxml2.parseDoc(source)
    ssDOM = libxml2.parseFile(stylesheet)
    return apply_xslt(sourceDOM, ssDOM)

def apply_xslt(sourceDOM, stylesheetDOM):
    style = libxslt.parseStylesheetDoc(stylesheetDOM)
    return style.applyStylesheet(sourceDOM, None).serialize()
    
def anonymize_smart_rdf (rdfres):
    for t in rdf_ontology.api_types:
        if t.is_statement or t.uri == rdf_ontology.sp.MedicalRecord:
            for q in rdfres.triples((None,rdf_ontology.rdf.type,t.uri)):
                rdf_ontology.remap_node(rdfres, q[0], rdflib.BNode())
                
    return rdfres

