from django.db import models, transaction, IntegrityError
from django.http import HttpResponse
from django.conf import settings

from string import Template


import psycopg2
import psycopg2.extras
import re
import RDF

dcterms = RDF.NS('http://purl.org/dc/terms/')
sp = RDF.NS('http://smartplatforms.org/')
rxn = RDF.NS('http://link.informatics.stonybrook.edu/rxnorm/')
rxcui = RDF.NS('http://link.informatics.stonybrook.edu/rxnorm/RXCUI/')
tty = RDF.NS('http://link.informatics.stonybrook.edu/rxnorm/TTY/')

def fuzzy_match_request(request):
    results = fuzzy_match(request.GET['q'])
    s = RDF.Serializer()
    return HttpResponse(s.serialize_model_to_string(fuzzy_match_rdf(results)), mimetype="application/rdf+xml")
    
def fuzzy_match_rdf(results):
    m = RDF.Model()
    n = RDF.Node(blank_identiefier='q')
    i=0
    for r in results:
        b = RDF.Node(blank_ideitifier="result_%s"%i)
        i += 1
        s = RDF.Statement(n, sp['fuzzy_match_rxnorm'], b)
        m.append(s)
        s = RDF.Statement(b, dcterms['title'],r['str'].encode())
        m.append(s)
        s = RDF.Statement(b, rxn['RXCUI'], rxcui["%s"%r['rxcui'].encode()]) 
        m.append(s)
        s = RDF.Statement(b, rxn['TTY'], tty["%s"%r['tty'].encode()]) 
        m.append(s)
    return m
        

def fuzzy_match(terms):
    terms = sorted(re.split("(\s|mg|MG|,)", terms), key=len)
    term_query = ""
    terms = " + ".join([
                 Template(""" \n (case when upper(str) like '%$name%' then $value else 0 end) \n """)
                 .substitute(name=x.upper(), value=len(x))
                 for x in terms
                 ])

    conn = psycopg2.connect("dbname='%s' user='%s' password='%s'" % 
                              (settings.DATABASE_RXN,
                               settings.DATABASE_USER,
                               settings.DATABASE_PASSWORD))

    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    q = Template("""    
        select rxcui, max(str) as str, max(tty) as tty from 
            (select *, 
            (
            $match_terms
            )  
            as score  from rxnconso where tty in ('SCD', 'SBD')) 
            scored_concept 
            GROUP BY rxcui 
            HAVING MAX(score ) > 1 
            order by max(score) desc, length(max(str)) asc limit 10;
         """).substitute(match_terms=terms)
  
    cur.execute(q)
    rows = cur.fetchall()
    return rows
    
