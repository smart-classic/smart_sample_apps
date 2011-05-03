from django.http import HttpResponse
from django.conf import settings
import psycopg2
import psycopg2.extras
import sys, re
from smart_client import oauth, smart
from smart_client.common.util import serialize_rdf, sp, rdf, bound_graph, Literal, BNode

conn = psycopg2.connect("dbname='%s' user='%s' password='%s'" % 
                          (settings.DATABASE_RXN,
                           settings.DATABASE_USER,
                           settings.DATABASE_PASSWORD))
cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

def get_smart_client(request):
    oa_params = oauth.parse_header(request.META['HTTP_AUTHORIZATION'])
    resource_tokens={'oauth_token':       oa_params['smart_oauth_token'],
                     'oauth_token_secret':oa_params['smart_oauth_token_secret']}

    ret = smart.SmartClient(settings.AC_OAUTH['consumer_key'], settings.SMART_SERVER_PARAMS, settings.AC_OAUTH, resource_tokens)
    ret.record_id = oa_params['smart_record_id']
    return ret

def check_allergies(request):
    print "checking allergies"
    sc = get_smart_client(request)
    meds = sc.records_X_medications_GET()
    allergies = sc.records_X_allergies_GET()    

    substances = []
    for a in allergies.triples((None, rdf["type"], sp["Allergy"])):
        a = a[0] #subject
        for sub in allergies.triples((a, sp["substance"], None)):
            sub = sub[2]
            for c in allergies.triples((sub, sp["code"], None)):
                c = c[2]
                substances.append(str(c))

    medications = []
    for m in meds.triples((None,rdf["type"], sp["Medication"])):
        m = m[0] # subject
        for code in meds.triples((m, sp["drugName"], None)):
            code = code[2]
            for c in meds.triples((code, sp["code"], None)):
                c = c[2]
                medications.append(str(c))

    r = check_allergies_helper( substances, medications )

    g = bound_graph()

    for conflict in r:
        print "Adding conflict", conflict
        g.add((BNode(), sp['conflict'], Literal(conflict)))
    return HttpResponse(serialize_rdf(g), mimetype="application/rdf+xml")

"""
Given 
   + a set of allergen codes (RxNorm INs and BNs) and 
   + a set of drug codes (RxNorm SCDs and CBDs)
determine any common RxNorm ingredients
"""
def check_allergies_helper(allergen_codes, drug_codes):
    ag = make_allergens_generic(allergen_codes)
    dg = generic_ingredients_for_drugs(drug_codes)
    
    print "Looking at intersection of two sets: " , ag, dg
    
    conflicts = ag & dg
    
    q = """select max(str) as allergy_warning from rxnconso c 
            where sab='RXNORM' and tty='IN' 
            and rxcui=ANY(%s) group by rxcui;"""
            
    cur.execute(q, (list(conflicts),))
    r = cur.fetchall()
    return [v['allergy_warning'] for v in r]

"""
drug_allergen_codes is a list of BN or IN RxNorm Concept IDs.
"""
def make_allergens_generic(drug_allergen_codes):
    if len(drug_allergen_codes)  == 0: return set()
    drug_allergen_codes = [str(x).split("/")[-1] for x in drug_allergen_codes]
    q = """select distinct ri.rxcui1 as allergen_ingredient 
            from rxnrel ri where ri.rxcui2 =ANY(%s) and ri.rela='tradename_of' 
           UNION
           select distinct c.rxcui as allergen_ingredient from rxnconso c where c.rxcui =ANY(%s)
           and c.sab='RXNORM' and c.tty='IN';"""
    
    cur.execute(q, (drug_allergen_codes,drug_allergen_codes))
    r = cur.fetchall()
    return set([v['allergen_ingredient'] for v in r])


def generic_ingredients_for_drugs(drug_codes):
    if len(drug_codes) == 0: return set()
    drug_codes = [str(x).split("/")[-1] for x in drug_codes]
    q = """select distinct rg.rxcui1 as drug_ingredient from rxnrel ri  
             join rxnrel rg on rg.rxcui2=ri.rxcui1 and rg.rela='has_ingredient'  
             join rxnconso c on c.rxcui=ri.rxcui1 and c.sab='RXNORM' and c.tty='SCDC' 
             where ri.rela='consists_of' and
             ri.rxcui2=ANY(%s);"""
           
    cur.execute(q, (drug_codes,))
    r = cur.fetchall()
    return set([v['drug_ingredient'] for v in r])

        
if __name__ == "__main__":
    for a in ['58930', '20610']:
        for d in ['210597', '315025']:
            w = check_allergies_helper([a], [d])
            assert(len(w) > 0), "Missed an allergy!"
            print "WARNING, drug/allergy conflict: "  + ", ".join(w)
