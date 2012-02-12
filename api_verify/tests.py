import os
import unittest
import string
import json
import threading

from smart_client.common.util import parse_rdf

lock = threading.Lock()
data = None
ct = None

class TestRDF(unittest.TestCase):
    def setUp(self):
        try:
            self.rdf = parse_rdf(data)
        except:
            self.rdf = None

    def testValidRDF(self):
        if not self.rdf:
            self.fail("RDF-XML parsing failed")
            
    def testContentType(self):
        self.assertEquals(ct,"application/rdf+xml", "HTTP content-type '" + ct + "' should be 'application/rdf+xml'")

class TestJSON(unittest.TestCase):
    def setUp(self):
        try:
            self.json = json.loads(data)
        except:
            self.json = None

    def testValidJSON(self):
        if not self.json:
            self.fail("JSON parsing failed")
            
    def testContentType(self):
        self.assertEquals(ct,"application/json", "HTTP content-type '" + ct + "' should be 'application/json'")
         
class TestAllergies(TestRDF):
    pass

class TestDemographics(TestRDF):
    def testBasicNodes(self):
        if self.rdf:
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
                }
                """
            
            answer = self.rdf.query(q)
            #if (answer.askAnswer[0] == False):
            self.fail ("RDF structure check failed\nAttempted the query:\n" + q)

class TestEncounters(TestRDF):
    pass
class TestFulfillments(TestRDF):
    pass
class TestLabResults(TestRDF):
    pass
class TestMedications(TestRDF):
    pass
class TestProblems(TestRDF):
    pass
class TestVitalSigns(TestRDF):
    pass
class TestOntology(TestRDF):
    pass
class TestCapabilities(TestJSON):
    pass
class TestManifests(TestJSON):
    def testStructure(self):
        self.fail("Bad structure")
class TestPreferences(unittest.TestCase):
    def testConsistency(self):
        if ct == 'application/json':
            try:
                json.loads(data)
            except:
                self.fail("HTTP content-type is 'application/json' but JSON parsing failed")
        if ct == 'application/rdf+xml':
            try:
                parse_rdf(data)
            except:
                self.fail("HTTP content-type is 'application/rdf+xml' but RDF-XML parsing failed")

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
    with lock:
        global data
        global ct
        data = testData
        ct = contentType
        alltests = unittest.TestLoader().loadTestsFromTestCase(tests[model])
        result = unittest.TextTestRunner(stream = open(os.devnull, 'w')).run(alltests)
        return result
    
def getMessages (result):
    res = []
    for e in result.failures:
        res.append ("[" + e[0]._testMethodName + "] " + getShortMessage(e[1]))
    for e in result.errors:
        res.append ("[" + e[0]._testMethodName + "] " + e[1])
    return res

def getShortMessage (message):
    s = message.split("AssertionError: ")
    #for i in s:
    #    if i.beginswith("AssertionError:"):
    #        r = i
    #s = s[len(s)-2]
    #r = r.split(": ")[1]
    return s[1]
