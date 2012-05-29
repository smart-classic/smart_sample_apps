'''Module query generation functionaly for the SMART API Verifier'''
# Developed by: Nikolai Schwertner
#
# Revision history:
#     2012-04-03 Refactored

# Standard module imports
import copy

# Import the app settings
from settings import APP_PATH, DOC_BASE

# Imports from the SMART client
from smart_client.common.rdf_tools import rdf_ontology
from smart_client.common.rdf_tools.util import NS, anyuri

# Import rdflib modules
import rdflib
from rdflib import Graph
from rdflib.namespace import NamespaceManager

# --- begin hack --- #
# Because the split_uri function in rdflib 3.2.0 does not support
# the full range of URIs that we need to split (for example, it will choke
# on "http://example.com/1234"), we have to wrap it in custom code.
# If the library splitter returns a result, fine. If not, then we
# try to produce a result via our custom split code (NJS 2012-04-09)
original_function = rdflib.namespace.split_uri

def _wrapper(uri):    
    try:
        return original_function(unicode(uri))
    except:
        try: 
            res = unicode(uri).rsplit("#",1)
            res[0] += "#"
            return res[0], res[1]
        except:
            try: 
                res = unicode(uri).rsplit("/",1)
                res[0] += "/"
                return (unicode(res[0]), unicode(res[1]))
            except: 
                 raise Exception("Can't split '%s'" % uri)
             
rdflib.namespace.split_uri = _wrapper

def split_uri (uri):
    return rdflib.namespace.split_uri(uri)
# --- end hack --- #
          
def normalize (uri, prefixes = None):
    '''Converts a URI into a 'namespace:term' string or <uri> entity 
       and (optionally) appends the namespace to the prefixes list'''
    
    # Split the uri into namespace and term
    namespace, term = split_uri(uri)

    # Resolve the namespace prefix
    prefs = [p for p in NS.keys() if str(NS[p]) == namespace]
    if len(prefs) == 1:
        namespace = prefs[0]
    else:
        namespace = None
        
    # Optionally append the namespace to the prefixes list
    if (prefixes and namespace) and (namespace not in prefixes):
        prefixes.append(namespace)
        
    # Return the 'namespace:term' string or the <url> (if no prefix matches)
    return namespace_manager.normalizeUri(unicode(uri))
    
def type_name_string(t):
    '''Returns the standard name of a data model'''
    if t.name:
        return str(t.name)
    return str(split_uri(str(t.uri))[1])

def get_prefix_defs (prefixes):
    '''Returns the prefix definition part of a SPARQL query bases on a list of prefixes'''
    
    out = ""
    
    # Build the prefixes string from the NS map
    for pref in prefixes:
        ns = [str(NS[p]) for p in NS.keys() if p == pref]
        if len(ns) == 1:
            out += "PREFIX %s:<%s>\n" % (pref, ns[0])
            
    return out
    
def generate_data_for_type(t, res):
    '''Populates the res model definition object with information about a SMART data type'''
    
    # Obtain the identifier of the data type
    # and initialize the corresponding key in res
    name = str(t.uri)
    res[name] = {}
    
    res[name]["name"] = type_name_string(t)

    if t.equivalent_classes: # For types with class equivalencies
        
        # Initialize the oneOf object property
        res[name]["oneOf"] = []
    
        # Process equivalent classes constraint data
        ec = filter(lambda x: x.one_of, t.equivalent_classes)
        
        
        for member in [x for c in ec for x in c.one_of]:
        
            # Get the data elements for the constraint
            ns, identifier = split_uri(member.uri)
            system = str(member.uri).split(identifier)[0]
            spcode = str(t.uri)
            
            # Construct the data object expressing the constraint
            data = {"code": spcode, "uri": str(member.uri), "title": member.title,
                    "system": system, "identifier": identifier}
                    
            # Appnd the data object to the model definition object
            res[name]["oneOf"].append(data)
            
    else: # For regular types
    
        # We are only interested in types with object or data properties
        if len(t.object_properties) + len(t.data_properties) == 0:
            return

        # Initialize the properties list
        res[name]["properties"] = []
        
        # Iterate over both the object and data properties
        for c in sorted(t.object_properties + t.data_properties, key=lambda r: str(r.uri)):

            # Initialize the local variables
            target = ""
            constraints = {}
            values = {}

            if type(c) is rdf_ontology.OWL_ObjectProperty: # Type with value or type constraints
            
                target = str(c.to_class.uri)
                further = filter(lambda x: isinstance(x.all_values_from, rdf_ontology.OWL_Restriction), c.restrictions)
                
                # Process constraints by adding them to the values and constraints dictionaries
                for f in further:
                    p = str(f.all_values_from.on_property)
                    avf = f.all_values_from
                    if avf.has_value:
                        values[p] = avf.has_value
                    else:
                        pc = avf.all_values_from
                        constraints[p] = str(pc.uri)

            elif type(c) is rdf_ontology.OWL_DataProperty: # Data properties
            
                # Identify the target literal
                avf = filter(lambda x: x.all_values_from, c.restrictions)
                if len(avf) >0: d = avf[0].all_values_from.uri
                else: d = str(rdf_ontology.rdfs.Literal)
                target = d

            # Construct the properties definition object for the data type
            prop = {"name":str(c.uri), "type": target, "cardinality": c.cardinality_string}
            if len(constraints) > 0: prop["constraints"] = constraints
            if len(values) > 0: prop["values"] = values
            
            # Append the properties definition
            res[name]["properties"].append(prop)
            
def generate_optional_object_type_query (data, subj_type_url, predicate_url, obj_type_url, queries):
    '''Generates an optional object type check query'''
    
    # We are not going to process RDF litera, dateTime, etc types
    if str(obj_type_url) in (str(NS['rdfs']['Literal']), str(NS['xsd']['dateTime']), str(anyuri)):
        return
        
    # Intialize the common prefixes list
    prefixes = ["rdf"]
    
    # Normalize the data URIs
    subj_type = normalize(subj_type_url, prefixes)
    predicate = normalize(predicate_url, prefixes)
    obj_type = normalize(obj_type_url, prefixes)
    
    # Construct the query string
    q = """%sSELECT  ?s
WHERE {
   ?s rdf:type %s .
   ?s %s ?o .
   OPTIONAL {
       ?o rdf:type ?t .
       FILTER ( str(?t) = %s )
   }
   FILTER ( !BOUND(?t) )
}""" % (get_prefix_defs(prefixes), subj_type, predicate, obj_type)
    
    # Documentation URL
    doc_model = data[subj_type_url]["name"].replace(" ", "_")
    doc_url = DOC_BASE + doc_model + "_RDF"
    
    # Add the query to the list of queries
    queries.append({
        "type": "negative",
        "query": q,
        "description": "%s property of %s object must be of type %s" % (predicate, subj_type, obj_type),
        "doc": doc_url
    })

def generate_value_query (data, model, property, type, values, queries):
    '''Generates a specific value check query (for instance units check)'''
    
    # Intialize the common prefixes list
    prefixes = ["rdf"]
    
    # Normalize the data URIs
    model_norm = normalize(model, prefixes)
    property = normalize(property, prefixes)
    type = normalize(type, prefixes)
    
    # Construct the common header for this class of queries
    query_header = """SELECT  ?p
WHERE {
   ?s rdf:type %s .
   ?s %s ?p .
   ?p rdf:type %s .
""" % (model_norm, property, type)

    # Now let's build a query for each predicate in the values
    for predicate in values:
    
        # Normalize the predicate uri using a local copy of the common prefixes list
        myprefs = copy.deepcopy(prefixes)
        obj = normalize(predicate, myprefs)
        
        # Construct the query 
        q = get_prefix_defs(myprefs) + query_header
        q += '   ?p %s ?u .\n' % (obj)
        q += '   FILTER (?u != "%s")\n}' % (values[predicate])
        
        # Documentation URL
        doc_model = data[model]["name"].replace(" ", "_")
        doc_url = DOC_BASE + doc_model + "_RDF"
        
        # Add the query to the list of generated queries
        queries.append({
            "type": "negative",
            "query": q,
            "doc": doc_url,
            "description": "%s %s %s value should be '%s'" % (property, type, obj, values[predicate])
        })

def generate_match_query (data, model, type, constraints, queries):
    '''Generates a match query based on the constraints provided'''

    # Default prefixes used in the output query
    prefixes = ["rdf", "dcterms", "sp", "spcode"]

    # We only know how to handle code constraints
    constraint = constraints["http://smartplatforms.org/terms#code"]

    # We should have a oneOf constraint in the data in order to proceed
    if "oneOf" not in data[constraint].keys():
        return
        
    # Normalize the model and type URIs
    model = normalize(model, prefixes)
    type = normalize(type, prefixes)
            
    # Construct the query string
    q = """%sSELECT  ?uri ?code ?identifier ?title ?system
WHERE {
   ?a %s ?c .
   ?c rdf:type %s .
   ?c sp:code ?uri .
   ?uri rdf:type sp:Code .
   ?uri rdf:type ?code.
   ?uri dcterms:identifier ?identifier .
   ?uri dcterms:title ?title .
   ?uri sp:system ?system .
   FILTER (str(?code) != sp:Code) .
}""" % (get_prefix_defs(prefixes), model, type)
    
    # Documentation URL
    constraint_type = str(split_uri(constraint)[1])
    doc_model = data[constraint]["name"].replace(" ", "_")
    doc_url = DOC_BASE + doc_model + "_code_RDF"
    
    # Add the query to the list of queries
    queries.append({
        "type": "match",
        "query": q,
        "description": "The code(s) should be (a) valid " + constraint_type,
        "doc": doc_url,
        "constraints": data[constraint]["oneOf"]
    })
      
def generate_queries (data, queries, type_url, visited_types = None):
    '''Pupulates the queries object recursively with queries appropriate for the data type'''
    
    # Initialize the visted types list as necessary to eliminate redundant queries
    # resulting from encountering the same type in different places in the model definition
    if visited_types is None: visited_types = []

    # Settings
    SUBJECT = "?s"
    OBJECT = "?o"
    INDENT = 4
    
    # Initialize the local variables
    prefixes = ["rdf"]
    type = normalize(type_url, prefixes)

    # We are not going to process RDF litera, dateTime, etc types
    if str(type_url) in (str(NS['rdfs']['Literal']), str(NS['xsd']['dateTime']), str(anyuri)):
        return ""
    
    # We only care about types that have properties that are not in the queries list already
    if ("properties" in data[type_url].keys()) and (type_url not in visited_types):
        
        # Take note of processing this type
        visited_types.append(type_url)
        
        # SPARQL fragment common to many select and 
        select_header = " " * INDENT
        select_header += " ".join((SUBJECT, "rdf:type", type, ".\n"))
        
        # Documentation URL
        doc_model = data[type_url]["name"].replace(" ", "_")
        doc_url = DOC_BASE + doc_model + "_RDF"
        
        # For all the properties of the type
        for p in data[type_url]["properties"]:
        
            # Get the property name and type
            p_name = str(p["name"])
            p_type = str(p["type"])
            
            # Start a local prefixes list for this property's queries
            prefixes_local = copy.deepcopy (prefixes)
            
            # Get the normalized predicate for the property
            predicate = normalize(p_name, prefixes_local)
        
            # If mandatory property
            if p["cardinality"] in ["1","1 - Many"]:
            
                # Make a local copy of the prefixes list
                prefixes_query = copy.deepcopy(prefixes_local)

                # Begin constructing the query
                q = "SELECT %s\nWHERE {\n" % SUBJECT
                q += select_header
                q += " " * INDENT + "OPTIONAL {\n"
                q += " " * (INDENT * 2)
                q += " ".join((SUBJECT, predicate, OBJECT, ".\n"))
                
                # If there are any value constraints, add them to the query
                if "values" in p.keys():
                    for pr in p["values"]:
                        q += " " * (INDENT * 2)
                        q += " ".join((OBJECT, normalize(pr, prefixes_query), '"' + p["values"][pr] + '"', ".\n"))
                
                # As long as the property is not 'belongsTo'
                if p_name != str(NS['sp']['belongsTo']):
                
                    # Recurse into the property and augment the query with the appropriate tripples from
                    # the query generation
                    q += generate_queries (data, queries, p_type, visited_types)
                    
                    # If applicable, generate a match query for the constraints and mark the type as visited
                    if "constraints" in p.keys() and p_name not in visited_types:
                        visited_types.append (p_name)
                        generate_match_query (data, p_name, p_type, p["constraints"], queries)
                
                # Finish off the query
                q += " " * INDENT + "}\n"
                q += " " * INDENT + "FILTER ( !BOUND(%s) )\n}" % OBJECT
                
                # Prepend the prefixes definitions to the query
                q = get_prefix_defs(prefixes_query) + q
                
                # Add the query to the queries list
                queries.append({
                   "type":"negative",
                   "query": q,
                   "doc": doc_url,
                   "description": "%s must have at least one %s property" % (type, predicate)
                })
             
            # If optional property (different from 'belongsTo')
            elif p_name != str(NS['sp']['belongsTo']):
                
                # Recursively generate further queries
                generate_queries (data, queries, p_type, visited_types)
                
                # Generat object type check query
                generate_optional_object_type_query (data, type_url, p_name, p_type, queries)
                
                # If there are values constraints, generate value queries
                if "values" in p.keys():
                    generate_value_query (data, type_url, p_name, p_type, p["values"], queries)
                    
                # If there are equivalent class constraints for types that have not been processed
                if "constraints" in p.keys() and p_name not in visited_types:
                    # Mark the type as visited
                    visited_types.append (p_name)
                    
                    # Generate a match query for the property
                    generate_match_query (data, p_name, p_type, p["constraints"], queries)
                    
            # If the property cardinality is not higher than 1
            if p["cardinality"] in ["1", "0 - 1"]:
            
                # Construct query
                q = get_prefix_defs(prefixes_local)
                q += "SELECT %s\nWHERE {\n" % SUBJECT
                q += select_header
                q += " " * INDENT
                q += " ".join((SUBJECT, predicate, "?v ."))+ "\n}"

                # Add the query to the queries list
                queries.append({
                    "type": "noduplicates",
                    "query": q,
                    "doc": doc_url,
                    "description": "%s should have no more than one %s properties" % (type, predicate)
                })
           
    # Construct and return the select sparql string corresponding to the type
    out = " " * (INDENT * 2)
    out += " ".join((OBJECT, "rdf:type", type, ".\n"))
    return out

def get_queries (model):
    '''Returns a list of test sparql queries for the given model'''
    
    queries = []
    generate_queries (data, queries, str(NS['sp'][model]))
    return queries


# Query builder state variables
main_types = []
data = {}
loaded = False

# Initialize the namespace manager object
namespace_manager = NamespaceManager(Graph())

# Import the namespaces into the namespace manager
for ns in NS.keys():
    namespace_manager.bind(ns, NS[ns], override=False)
    
# Parse the ontology when necessary
if not rdf_ontology.api_types:
    rdf_ontology.parse_ontology(open(APP_PATH + '/data/smart.owl').read())

# Build a list of data types that need to be added to the data definitions
for t in rdf_ontology.api_types:
    if t.is_statement or len(t.calls) > 0 or rdf_ontology.sp.Component in [x.uri for x in t.parents]:
        main_types.append(t)

# Build the data definitions object with each data type
for t in main_types: 
    generate_data_for_type(t, data)