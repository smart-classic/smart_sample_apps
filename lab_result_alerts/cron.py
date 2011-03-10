"""
Cron job to check lab results for critical values and generate alerts.

Josh Mandel
joshua.mandel@childrens.harvard.edu
"""
import sys, time
from smart_client.smart import SmartClient
from smart_client.common.util import *
from django.conf import settings

def get_smart_client(resource_tokens=None):
    ret = SmartClient(settings.SS_OAUTH['consumer_key'], settings.SMART_SERVER_PARAMS, settings.SS_OAUTH, resource_tokens)
    ret.stylesheet = "%s%s"%(settings.XSLT_STYLESHEET_LOC, "ccr_to_med_rdf.xslt")
    return ret

def check_records():
    smart_client = get_smart_client()
    print dir(smart_client)
    
    for record_id in smart_client.loop_over_records():
        print "Getting labs ", record_id, time.time()        
        labs = smart_client.records_X_lab_results_GET()
        result_count = len(list(labs.triples((None, rdf.type, sp.LabResult))))

        g = bound_graph()
        a = BNode()
        g.add((a, rdf.type, sp.Alert))

        s = BNode()
        g.add((s, rdf.type, sp.CodedValue))

        i = URIRef("http://smartplatforms.org/terms/code/alertLevel#information")
        g.add((s, sp.code, i))
        g.add((i, rdf.type, sp.Code))
        g.add((s, sp.title, Literal("Information")))
        g.add((a, sp.severity, s))
        g.add((a, sp.notes, Literal("Patient has %s lab values!"%result_count)))

        print "serialized", serialize_rdf(g)
        gs =  serialize_rdf(g)
        a_res = smart_client.records_X_alerts_POST(data=gs, content_type="application/rdf+xml")
        print "Posted alert", time.time(), serialize_rdf(a_res)

if __name__ == "__main__":
    check_records()
