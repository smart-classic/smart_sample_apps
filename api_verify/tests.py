import os
import unittest
import string
import json
import threading

import query_builder
import dateutil.parser

from smart_client.common.util import parse_rdf

lock = threading.Lock()
data = None
ct = None
currentModel = None

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
                
class TestRDFStructure(unittest.TestCase):
    def setUp(self):
        try:
            self.rdf = parse_rdf(data)
        except:
            self.rdf = None

    def testStructure(self):
        if self.rdf:
            q = query_builder.get_query(currentModel)
            print "testing with", q
            
            answer = self.rdf.query(q)
            if (answer.askAnswer[0] == False):
                self.fail ("RDF structure check failed\nAttempted the query:\n" + q)

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
    def testStructure(self):
        if self.rdf:
            q1 = query_builder.get_query("Allergy")   
            q2 = query_builder.get_query("AllergyExclusion")
            answer1 = self.rdf.query(q1)
            answer2 = self.rdf.query(q2)
            if (answer1.askAnswer[0] == False and answer2.askAnswer[0] == False):
                self.fail ("RDF structure check failed\nAttempted the querries:\n" + q1 + "\n" + q2)

class TestDemographics(TestRDF, TestRDFStructure):
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
                   ?r v:email ?email .
                }
                """
            
            answer = self.rdf.query(q)
            if (answer.askAnswer[0] == False):
                self.fail ("RDF structure check failed\nAttempted the query:\n" + q)

class TestEncounters(TestRDF, TestRDFStructure):
    pass
    
class TestFulfillments(TestRDF, TestRDFStructure):
    pass
    
class TestLabResults(TestRDF, TestRDFStructure):
    pass
    
class TestMedications(TestRDF, TestRDFStructure):
    pass
    
class TestProblems(TestRDF, TestRDFStructure):
    pass
    
class TestVitalSigns(TestRDF, TestRDFStructure):
    def testHeight(self):
        if self.rdf:
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
            
            data = self.rdf.query(q)
            for d in data:
                vital_date = str(d[0])
                height = str(d[1])
                units = str(d[2])
                
                try:
                    dateutil.parser.parse(vital_date)
                except ValueError:
                    self.fail("Encountered non-ISO8601 date: " + vital_date)

                try:
                    float(height)
                except ValueError:
                    self.fail("Could not parse height value: " + height)
                    
                if units not in ('m', 'cm'):
                    self.fail("Encountered bad units: " + units)
                    
    def testBloodPressure(self):
        if self.rdf:
            q = """
                PREFIX dcterms:<http://purl.org/dc/terms/>
                PREFIX sp:<http://smartplatforms.org/terms#>
                SELECT  ?vital_date ?bloodPressure
                WHERE {
                   ?v dcterms:date ?vital_date .
                   ?v sp:bloodPressure ?bloodPressure .
                }
                """
            
            data = self.rdf.query(q)
            for d in data:
                vital_date = str(d[0])
                bloodPressure = str(d[1])
                
                try:
                    dateutil.parser.parse(vital_date)
                except ValueError:
                    self.fail("Encountered non-ISO8601 date: " + vital_date)
                    
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
            
                data2 = self.rdf.query(q)
                
                for t in data2:
                    systolic = str(t[0])
                    diastolic = str(t[1])
                    units1 = str(t[2])
                    units2 = str(t[3])
                    
                    try:
                        float(systolic)
                    except ValueError:
                        self.fail("Could not parse systolic pressure value: " + systolic)
                        
                    try:
                        float(diastolic)
                    except ValueError:
                        self.fail("Could not parse diastolic pressure value: " + diastolic)
                    
                    if units1 not in ('mm[Hg]'):
                        self.fail("Encountered bad units: " + units1)
                        
                    if units2 not in ('mm[Hg]'):
                        self.fail("Encountered bad units: " + units2)
                
class TestOntology(TestRDF):
    pass
    
class TestCapabilities(TestJSON):
    pass
    
class TestManifests(TestJSON):
    pass
    
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
        global currentModel
        data = testData
        ct = contentType
        currentModel = model
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
