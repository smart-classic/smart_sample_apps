from django.db import models, transaction, IntegrityError
from django.http import HttpResponse
from django.conf import settings
from string import Template
import psycopg2
import psycopg2.extras
import re
import RDF
import libxml2
import RDF

from smart_client.rdf_utils import *
from subprocess import Popen, PIPE, STDOUT

dcterms = RDF.NS('http://purl.org/dc/terms/')
sp = RDF.NS('http://smartplatforms.org/')
rxn = RDF.NS('http://link.informatics.stonybrook.edu/rxnorm/')
rxcui = RDF.NS('http://link.informatics.stonybrook.edu/rxnorm/RXCUI/')
tty = RDF.NS('http://link.informatics.stonybrook.edu/rxnorm/TTY/')

def extract_meds(request):
    p = Popen(['/home/jmandel/cTAKES/med_extract.sh'], stdout=PIPE,stdin=PIPE,stderr=PIPE)
    f = request.raw_post_data
    print "evaluating ", f
    meds = p.communicate(input=f)[0]
    print "output was ", meds
    d = libxml2.parseDoc(meds)    
    c = d.xpathNewContext()
    c.xpathRegisterNs("mayo", "http:///edu/mayo/bmi/uima/core/type.ecore")
    c.xpathRegisterNs("xmi", "http://www.omg.org/XMI")
    meds_found  = c.xpathEval('//mayo:NamedEntity[@typeID="1"][@certainty!="-1"]/@ontologyConceptArr')

    conn = psycopg2.connect("dbname='%s' user='%s' password='%s'" % 
                              (settings.DATABASE_RXN,
                               settings.DATABASE_USER,
                               settings.DATABASE_PASSWORD))
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    q = """select distinct str from rxnconso where sab='RXNORM' and rxcui=%s;"""

    cuis_added = []
    model = RDF.Model()    
    for med_array in meds_found:
        print "Found %s"%med_array
        for med in med_array.content.split(" "):
            rxn_cui = c.xpathEval("//*[@codingScheme='RXNORM'][@xmi:id='%s']"%med)[0].xpathEval("@code")[0].content
            print "looking up %s"%rxn_cui
            cur.execute(q, (rxn_cui,))
            medname = cur.fetchall()[0][0]   
            print "name: ", medname
            print "cui ", rxn_cui
            if (rxn_cui not in cuis_added):
                add_med(model, str(rxn_cui), medname)
                cuis_added.append(rxn_cui)
                
    ret = serialize_rdf(model)
    print "returning ", ret
    return HttpResponse(ret, mimetype="application/rdf+xml")      

def add_med(model, cui, title):
    m = model
    med = RDF.Node()
    
    s = RDF.Statement(med, 
        RDF.Node(NS["rdf"]["type"]), 
        RDF.Node(NS["sp"]["medication"]))
    m.append(s)
    s = RDF.Statement(med,
        RDF.Node(NS["med"]["drug"]),
        RDF.Node(NS["rxcui"][cui]))
    m.append(s)
    s = RDF.Statement(med,
        RDF.Node(NS["dcterms"]["title"]),
        RDF.Node(literal=title))
    m.append(s)    
