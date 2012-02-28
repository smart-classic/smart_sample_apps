'''Module providing testing functionaly for the SMART API Verifier'''
# Developed by: Nikolai Schwertner
#
# Revision history:
#     2012-02-24 Initial release

# Import some general modules
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

# RDF parsing wrapper from the SMART python client
from smart_client.common.util import parse_rdf

# Global variables for state synchronization accross the test suites
lock = threading.Lock()
data = None
ct = None
currentModel = None

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
    
    def testContentType(self):
        '''Verifies that the content type provided is application/rdf+xml'''
        RDF_MIME = "application/rdf+xml"
        self.assertEquals(ct, RDF_MIME, "HTTP content-type '%s' should be '%s'" % (ct, RDF_MIME))
                
class TestDataModelStructure(unittest.TestCase):
    '''Tests for RDF document structure and content types'''
    
    def setUp(self):
        '''General tests setup (parses the RDF string in the global data var)'''
        try:
            self.rdf = parse_rdf(data)
        except:
            self.rdf = None

    def testStructure(self):
        '''Tests the data model structure with an automatically generated SPARQL query based on the ontology'''
        if self.rdf:
            # Generate the query
            q = query_builder.get_query(currentModel)
            
            # Run the query and report any failures
            answer = self.rdf.query(q)
            if (answer.askAnswer[0] == False):
                self.fail ("RDF structure check failed\nAttempted the query:\n" + q)

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
    def testStructure(self):
        '''Tests the data model structure with automatically generated SPARQL queries based on the ontology
        
        This model is a corner case, because it is allowed to confirm to either one of two patterns (Allergy and AllergyExclusion)'''
        if self.rdf:
            # Generate the queries
            q1 = query_builder.get_query("Allergy")   
            q2 = query_builder.get_query("AllergyExclusion")
            
            # Run the queries
            answer1 = self.rdf.query(q1)
            answer2 = self.rdf.query(q2)
            
            # Fail when neither query does not return any matches
            if (answer1.askAnswer[0] == False and answer2.askAnswer[0] == False):
                self.fail ("RDF structure check failed\nAttempted the querries:\n" + q1 + "\n" + q2)

class TestDemographics(TestRDF, TestDataModelStructure):
    '''Tests for the Demographics data model'''
    
    def testBasicNodes(self):
        '''A good general test for the Demographics model'''
        if self.rdf:
        
            # A SPARQL ASK query testing for the presence of a set of pre-defined nodes
            q = """
                PREFIX foaf:<http://xmlns.com/foaf/0.1/>
                PREFIX v:<http://www.w3.org/2006/vcard/ns#>
                PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                ASK {
                   ?r v:n ?n .
                   ?n rdf:type v:Name .
                   ?n v:given-name ?firstname .
                   ?n v:family-name ?lastname .
                   ?r foaf:gender ?gender .
                   ?r v:bday ?birthday .
                   ?r v:email ?email .
                }
                """
            
            # Run the query and report the result
            answer = self.rdf.query(q)
            if (answer.askAnswer[0] == False):
                self.fail ("RDF structure check failed\nAttempted the query:\n" + q)

class TestEncounters(TestRDF, TestDataModelStructure):
    '''Tests for the Encounters data model'''
    pass
    
class TestFulfillments(TestRDF, TestDataModelStructure):
    '''Tests for the Fulfillments data model'''
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
    
class TestVitalSigns(TestRDF, TestDataModelStructure):
    '''Tests for the Vital Signs data model'''
    
    def testHeight(self):
        '''Tests the height component of the Vital Signs RDF'''
        
        if self.rdf:
        
            # Query for extracting height data from the RDF stream
            q = """
                PREFIX dcterms:<http://purl.org/dc/terms/>
                PREFIX sp:<http://smartplatforms.org/terms#>
                SELECT  ?vital_date ?height ?units
                WHERE {
                   ?v dcterms:date ?vital_date .
                   ?v sp:height ?h .
                   ?h sp:value ?height .
                   ?h sp:unit ?units .
                }
                """
            
            # Run the query
            data = self.rdf.query(q)
            
            for d in data:
                # Store the data in local variables
                vital_date = str(d[0])
                height = str(d[1])
                units = str(d[2])
                
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
                
                # The units should be meters
                if units != 'm':
                    self.fail("Encountered bad units: " + units)
                    
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
                    SELECT  ?systolic ?diastolic ?units1 ?units2
                    WHERE {
                       _:%s sp:systolic ?s .
                       ?s sp:value ?systolic .
                       ?s sp:unit ?units1 .
                       _:%s sp:diastolic ?d .
                       ?d sp:value ?diastolic .
                       ?d sp:unit ?units2 .
                    }
                    """ % (bloodPressure, bloodPressure)
            
                # Run the query
                data2 = self.rdf.query(q)
                
                for t in data2:
                    # Fetch the query results
                    systolic = str(t[0])
                    diastolic = str(t[1])
                    units1 = str(t[2])
                    units2 = str(t[3])
                    
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
                    
                    # Make sure that the units are mmHg
                    if units1 != 'mm[Hg]':
                        self.fail("Encountered bad units: " + units1)
                        
                    if units2 != 'mm[Hg]':
                        self.fail("Encountered bad units: " + units2)
                
class TestOntology(TestRDF):
    '''Tests for the ontology'''
    pass
    
class TestCapabilities(TestJSON):
    '''Tests for the capabilities API'''
    pass
    
class TestManifests(TestJSON):
    '''Tests for the manifests'''
    pass
    
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
         'Demographics': TestDemographics,
         'Container': TestCapabilities,
         'Encounter': TestEncounters,
         'Fulfillment': TestFulfillments,
         'LabResult': TestLabResults,
         'Medication': TestMedications,
         'Ontology': TestOntology,
         'Problem': TestProblems,
         'UserPreferences': TestPreferences,
         'VitalSigns': TestVitalSigns}

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
        alltests = unittest.TestLoader().loadTestsFromTestCase(tests[model])
        
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
