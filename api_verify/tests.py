'''Module providing testing functionaly for the SMART API Verifier'''
# Developed by: Nikolai Schwertner
#
# Revision history:
#     2012-02-24 Initial release

# Standard module imports
import os
import unittest
import string
import json
import threading

# ISO 8601 date parser
# Make sure that you match the version of the library with your version
# of Python when you install it (Setup Tools / Easy Install does it incorrectly)
import dateutil.parser

# Enables automated sparql query generation from the ontology
import query_builder

# Import the manifest validator function
from smart_client.common.utils.manifest_tests import app_manifest_structure_validator, container_manifest_structure_validator

# RDF parsing wrapper from the SMART python client
from smart_client.common.rdf_tools.util import parse_rdf

# Global variables for state synchronization accross the test suites
lock = threading.Lock()
data = None
ct = None
currentModel = None

class TestDefault(unittest.TestCase):
    '''Default tests run on unidentified models'''
    
    def testUnknown(self):
        self.fail("Data model does not have an associated test suite")

class TestRDF(unittest.TestCase):
    '''Tests for RDF data parsing and content types'''

    def setUp(self):
        '''General tests setup (parses the RDF string in the global data var)'''
        try:
            self.rdf = parse_rdf(data)
            self.failed = False
        except:
            self.rdf = None
            self.failed = True

    def testValidRDF(self):
        '''Reports the outcome of the RDF parsing'''
        if self.failed:
            self.fail("RDF-XML parsing failed")
        elif not self.rdf:
            self.fail("EMPTY RESULT SET")
    
    def testContentType(self):
        '''Verifies that the content type provided is application/rdf+xml'''
        RDF_MIME = "application/rdf+xml"
        self.assertEquals(ct, RDF_MIME, "HTTP content-type '%s' should be '%s'" % (ct, RDF_MIME))

def testRDF (graph, model):
    '''Service method testing a graph against a data model from the ontology
    
    Returns a string containing the applicable error messages or an empty
    string when no pronlems have been found.'''

    # Vars for tracking of the test state
    message = ""

    # Generate the queries
    queries = query_builder.get_queries(model)
    
    # Iterate over the queries
    for query in queries:
    
        # Get the query type and the query string
        type = query["type"]
        q = query["query"]
        desc = query["description"]
        
        # Negative queries should not return any results
        if type == "negative":
            # Run the query and report any failures
            try:
                results = graph.query(q)
            except:
                print "problem with QUERY!"
                print q
                
            
            # Stingify the results (limit to first 3)
            # This is needed to work around a bug in rdflib where the non-matched results
            # are still return as "none" objects
            myres = []
            for r in results:
                if len (myres) < 3 and r:
                    myres.append(str(r))
            
            # If we get a result (the queries are assumed to be negative),
            # then we should build a failure message about the event
            if len(myres) > 0 :
                if len(message) == 0:
                    message = "RDF structure check failed\n"
                message += "\nUnexpected results (first 3 shown):\n"
                for m in myres:
                    message += "   " + m + "\n"
                message += describeQuery(query) + "\n"
        
        # The results of match queries should match one of the constraints       
        elif type == "match":       
            # Run the query and report any failures
            results = graph.query(q)
            
            # Lists the first 3 unmatched results
            unmatched_results = []

            # With each result
            for r in results:
            
                # Assume unmatched until a match is found
                matched = False
                
                # Build a tuple from the fields in the result
                res = (str(r[0]).lower(),str(r[1]).lower(),str(r[2]).lower(),str(r[3]).lower(),str(r[4]).lower())
                
                # With each constraint
                for c in query["constraints"]:
                
                    # Match the result against the constraint via case-insensitive matching
                    con = (c['uri'].lower(), c['code'].lower(), c['identifier'].lower(), c['title'].lower(), c['system'].lower())
                    if res == con:
                        matched = True
                
                # Add the unmatched result as a string to the list of unmatched results (limit is 3)
                if not matched and len (unmatched_results) < 3:
                    out = "    {\n"
                    out += '        "code": ' + str(r[1]) + ',\n'
                    out += '        "identifier": ' + str(r[2]) + ',\n'
                    out += '        "system": ' + str(r[4]) + ',\n'
                    out += '        "title": ' + str(r[3]) + ',\n'
                    out += '        "uri": ' + str(r[0]) + ',\n'
                    out += "    }"
                    unmatched_results.append(out)
            
            # Finally, if we have any unmatched results, we should construct a failure message about them
            if len (unmatched_results) > 0:
                if len(message) == 0:
                    message = "RDF structure check failed\n"
                message += "\nInvalid results (first 3 shown):\n"
                message += ",\n".join(unmatched_results) + "\n"
                message += describeQuery(query) + "\n"
                    
        # Singular queries test for violations of "no more than 1" restrictions.
        # There should be no duplicates in the result set
        elif type == "noduplicates":
            
            # Run the query and report any failures
            results = graph.query(q)
            
            # Stingify the results
            myres = []
            for r in results:
                if len (myres) < 3 and r:
                    myres.append(str(r))
            
            # Find the first 3 duplicates in the result set
            checked = []
            duplicates = []
            for s in myres:
                if s not in checked:
                    checked.append (s)
                elif len(duplicates) < 3:
                    duplicates.append (s)
                  
            # Set up a failure message when we have duplicates
            if len(duplicates) > 0:
                
                if len(message) == 0:
                    message = "RDF structure check failed\n"
                message += "\nUnexpected duplicates (first 3 shown):\n"
                for m in duplicates:
                    message += "   " + m + "\n"
                message += describeQuery(query) + "\n"
                 
    # Return the failure message
    return message
  
class TestDataModelStructure(unittest.TestCase):
    '''Tests for RDF document structure and content types'''
    
    def setUp(self):
        '''General tests setup (parses the RDF string in the global data var)'''
        try:
            self.rdf = parse_rdf(data)
        except:
            self.rdf = None

    def testStructure(self):
        '''Tests the data model structure with an automatically generated SPARQL queries based on the ontology'''

        if self.rdf:

            # Run the queries against the RDF and get the error message (if any)
            message = testRDF (self.rdf, currentModel)

            # Trigger the fail process if we have failed any of the queries
            if len(message) > 0: self.fail (message)

class TestJSON(unittest.TestCase):
    '''Tests for JSON data parsing and content types'''
    
    def setUp(self):
        '''General tests setup (parses the JSON string in the global data var)'''
        try:
            self.json = json.loads(data)
        except:
            self.json = None

    def testValidJSON(self):
        '''Reports the outcome of the JSON parsing'''
        if not self.json:
            self.fail("JSON parsing failed")

    def testContentType(self):
        '''Verifies that the content type provided is application/json'''
        JSON_MIME = "application/json"
        self.assertEquals(ct, JSON_MIME, "HTTP content-type '%s' should be '%s'" % (ct, JSON_MIME))
         
class TestAllergies(TestRDF):
    '''Tests for Allergies data model'''
    def testStructureAllergy(self):
        '''Tests the data model structure with automatically generated SPARQL queries based on the ontology
        
        This model is a corner case, because it is allowed to confirm to either one of two patterns (Allergy or AllergyExclusion)'''
        if self.rdf:
            # Run the queries against the RDF and get the error messages (if any)
            message1 = testRDF (self.rdf, "Allergy")
            message2 = testRDF (self.rdf, "AllergyExclusion")

            # Trigger the fail process if we have failed any of the queries
            if len(message1) > 0 or len(message2) > 0: self.fail (message1 + message2)

class TestDemographics(TestRDF, TestDataModelStructure):
    '''Tests for the Demographics data model'''
    
    def testGender(self):
        '''Tests the gender component of the Demographics RDF'''
        
        if self.rdf:
        
            # Query for extracting height data from the RDF stream
            q = """
                   PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                   PREFIX sp:<http://smartplatforms.org/terms#>
                   PREFIX foaf:<http://xmlns.com/foaf/0.1/>
                   SELECT ?gender
                   WHERE {
                       ?s rdf:type sp:Demographics .
                       ?s foaf:gender ?gender .
                   }
                """
            
            # Run the query
            data = self.rdf.query(q)
            
            valid_vals = ("male", "female", "undifferentiated")
            
            for d in data:
                gender = str(d[0])

                if gender not in valid_vals:
                    self.fail("Gender '%s' is not one of (%s)" %(gender, ", ".join(valid_vals)))

    
class TestClinicalNotes(TestRDF, TestDataModelStructure):
    '''Tests for the Clinical Notes data model'''
    pass

class TestEncounters(TestRDF, TestDataModelStructure):
    '''Tests for the Encounters data model'''
    pass
    
class TestFulfillments(TestRDF, TestDataModelStructure):
    '''Tests for the Fulfillments data model'''
    pass
    
class TestImmunizations(TestRDF, TestDataModelStructure):
    '''Tests for the Immunizations data model'''
    pass
    
class TestLabPanels(TestRDF, TestDataModelStructure):
    '''Tests for the Lab Panels data model'''
    pass
    
class TestLabResults(TestRDF, TestDataModelStructure):
    '''Tests for the Lab Results data model'''
    pass
    
class TestMedications(TestRDF, TestDataModelStructure):
    '''Tests for the Medications data model'''
    pass
    
class TestProblems(TestRDF, TestDataModelStructure):
    '''Tests for the Problems data model'''
    pass
    
class TestProcedures(TestRDF, TestDataModelStructure):
    '''Tests for the Procedures data model'''
    pass
    
class TestVitalSignSets(TestRDF, TestDataModelStructure):
    '''Tests for the Vital Signs data model'''
    
    def testHeight(self):
        '''Tests the height component of the Vital Signs RDF'''
        
        if self.rdf:
        
            # Query for extracting height data from the RDF stream
            q = """
                PREFIX dcterms:<http://purl.org/dc/terms/>
                PREFIX sp:<http://smartplatforms.org/terms#>
                SELECT  ?vital_date ?height
                WHERE {
                   ?v dcterms:date ?vital_date .
                   ?v sp:height ?h .
                   ?h sp:value ?height .
                }
                """
            
            # Run the query
            data = self.rdf.query(q)
            
            for d in data:
                # Store the data in local variables
                vital_date = str(d[0])
                height = str(d[1])

                # Test the date parsing
                try:
                    dateutil.parser.parse(vital_date)
                except ValueError:
                    self.fail("Encountered non-ISO8601 date: " + vital_date)

                # See if the height is a number
                try:
                    float(height)
                except ValueError:
                    self.fail("Could not parse height value: " + height)

    def testBloodPressure(self):
        '''Tests the blood pressure component of the vital signs RDF'''
        
        if self.rdf:
            
            # Query for extracting of the date and the blood pressure anonymous node label
            q = """
                PREFIX dcterms:<http://purl.org/dc/terms/>
                PREFIX sp:<http://smartplatforms.org/terms#>
                SELECT  ?vital_date ?bloodPressure
                WHERE {
                   ?v dcterms:date ?vital_date .
                   ?v sp:bloodPressure ?bloodPressure .
                }
                """
            
            # Run the query
            data = self.rdf.query(q)
            
            for d in data:
            
                # Get the query results
                vital_date = str(d[0])
                bloodPressure = str(d[1])
                
                # Test the expected date against the ISO 8601 standard
                try:
                    dateutil.parser.parse(vital_date)
                except ValueError:
                    self.fail("Encountered non-ISO8601 date: " + vital_date)
                
                # Construct a query for extracting the specific values of the blood pressure reading
                q = """
                    PREFIX dcterms:<http://purl.org/dc/terms/>
                    PREFIX sp:<http://smartplatforms.org/terms#>
                    SELECT  ?systolic ?diastolic
                    WHERE {
                       _:%s sp:systolic ?s .
                       ?s sp:value ?systolic .
                       _:%s sp:diastolic ?d .
                       ?d sp:value ?diastolic .
                    }
                    """ % (bloodPressure, bloodPressure)
            
                # Run the query
                data2 = self.rdf.query(q)
                
                for t in data2:
                    # Fetch the query results
                    systolic = str(t[0])
                    diastolic = str(t[1])
                    
                    # See if the systolic value is a numeric
                    try:
                        float(systolic)
                    except ValueError:
                        self.fail("Could not parse systolic pressure value: " + systolic)
                        
                    # See if the diastolic value is a numeric
                    try:
                        float(diastolic)
                    except ValueError:
                        self.fail("Could not parse diastolic pressure value: " + diastolic)
                
class TestOntology(TestRDF):
    '''Tests for the ontology'''
    pass
    
class TestContainerManifest(TestJSON):
    '''Tests for the container manifest API'''
    
    def testStructure (self):
        '''A simple structure test for the container manifesst JSON output'''
        
        if self.json: 
            messages = container_manifest_structure_validator(self.json)
            if len(messages) > 0 :
                self.fail ("Container manifest structure test failed\n" + "\n".join(messages))
        

                    
class TestManifest(TestJSON):
    '''Tests for a single manifest'''

    def testStructure (self):
        '''Test for the manifests JSON output'''
        
        if self.json: 
            messages = app_manifest_structure_validator(self.json)
            if len(messages) > 0 :
                self.fail ("App manifest structure test failed\n" + "\n".join(messages))
    
class TestManifests(TestJSON):
    '''Tests for the manifests'''

    def testStructure (self):
        '''Test for the manifests JSON output'''
        
        if self.json:
        
            if type(self.json) != list:
                self.fail ("The JSON payload should be a list")
        
            # Because we have a list of manifests, we have to iterate over the items
            messages = []
            for manifest in self.json:
                messages += app_manifest_structure_validator(manifest)
            if len(messages) > 0 :
                self.fail ("App manifests structure test failed\n" + "\n".join(messages))
    
class TestPreferences(unittest.TestCase):
    '''Tests for the Preferences API'''
    
    def testConsistency(self):
        '''Tests if the data is consistent with the content type (when RDF or JSON)'''
        
        # When the content type is application/json, try parsing the data as JSON
        if ct == 'application/json':
            try:
                json.loads(data)
            except:
                self.fail("HTTP content-type is 'application/json' but JSON parsing failed")
            
        # When the content type is application/rdf+xml, try parsing the data as RDF
        if ct == 'application/rdf+xml':
            try:
                parse_rdf(data)
            except:
                self.fail("HTTP content-type is 'application/rdf+xml' but RDF-XML parsing failed")

# Defines the mapping between the content models and the test suites
tests = {'Allergy': TestAllergies,
         'AppManifest': TestManifests,
         'Manifest': TestManifest,   # this is a custom model not present in the ontology
         'Demographics': TestDemographics,
         'ClinicalNote': TestClinicalNotes,
         'ContainerManifest': TestContainerManifest,
         'Encounter': TestEncounters,
         'Fulfillment': TestFulfillments,
         'Immunization': TestImmunizations,
         'LabPanel': TestLabPanels,
         'LabResult': TestLabResults,
         'Medication': TestMedications,
         'Ontology': TestOntology,
         'Problem': TestProblems,
         'Procedure': TestProcedures,
         'UserPreferences': TestPreferences,
         'VitalSignSet': TestVitalSignSets}

def runTest(model, testData, contentType=None):
    '''Runs the test suite applicable for a model'''
    
    # The lock assures that any concurrent threads are synchronized so that
    # they don't interfere with each other through the global variables
    with lock:
    
        # Get hold of the global variables
        global data
        global ct
        global currentModel
        
        # Assign the input data to the globals
        data = testData
        ct = contentType
        currentModel = model
        
        # Load the test from the applicable test suite
        if model in tests.keys():
            alltests = unittest.TestLoader().loadTestsFromTestCase(tests[model])
        else:
            alltests = unittest.TestLoader().loadTestsFromTestCase(TestDefault)
        
        # Run the tests
        results = unittest.TextTestRunner(stream = open(os.devnull, 'w')).run(alltests)
        
        # Return the test results
        return results
    
def getMessages (results):
    '''Returns an array of strings representing the custom failure messages from the results'''
    
    res = []
    
    # Add all the failure messages to the array
    for e in results.failures:
        res.append ("[" + e[0]._testMethodName + "] " + getShortMessage(e[1]))
        
    # And then add all the error messages
    for e in results.errors:
        res.append ("[" + e[0]._testMethodName + "] " + e[1])

    return res

def getShortMessage (message):
    '''Returns the custom message portion of a unittest failure message'''
    
    s = message.split("AssertionError: ")
    return s[1]
    
def describeQuery (q):
    '''Returns a string describing a test query'''

    out = "Test:\n   %s\n" % q["description"]
    if q["type"] == "negative":
        out += "Fail condition:\n   Query returns a non-empty result set\n"
    elif q["type"] == "noduplicates":
        out += "Fail condition:\n   Query result set contains duplicates\n"
    elif q["type"] == "match":
        out += "Fail condition:\n   The results of the query don't match any of the patterns:\n"
        out += json.dumps(q["constraints"], sort_keys=True, indent=4).replace("[\n","").replace("]","")
    out += "Query:\n   " + "\n   ".join(q["query"].split("\n")) + "\n"
    out += "For further information:\n   %s" % q["doc"]
        
    return out


def describeQueries (model):
    '''Returns a string describing the test queries used in testing a data model'''

    out = "-" * 80 + "\n"

    for q in query_builder.get_queries(model):
        out += describeQuery(q) + "\n" + "-" * 80 + "\n"
        
    return out
