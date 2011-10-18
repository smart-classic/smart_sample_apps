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
    ret = SmartClient(settings.SS_OAUTH['consumer_key'], {'api_base': settings.SMART_API_SERVER_BASE}, settings.SS_OAUTH, resource_tokens)
    return ret

def check_records():
    smart_client = get_smart_client()
    print dir(smart_client)
    
    for record_id in smart_client.loop_over_records():
        print "Getting labs ", record_id, time.time()        
        labs = smart_client.records_X_lab_results_GET()

        g = bound_graph()
        a = BNode()
        g.add((a, rdf.type, sp.Alert))

        s = BNode()
        g.add((s, rdf.type, sp.CodedValue))

        severity = Namespace("http://smartplatforms.org/terms/code/alertLevel#")
        g.add((s, sp.code, severity.information))
        g.add((s, sp.title, Literal("Information")))
        g.add((a, sp.severity, s))

        # Here is a sample placeholder for CDS logic:  
        # count up the # of lab values and report it
        # as an information-level alert.
        result_count = len(list(labs.triples((None, rdf.type, sp.LabResult))))
        g.add((a, sp.notes, Literal("Patient has %s lab values!"%result_count)))
        gs =  serialize_rdf(g)

        a_res = smart_client.records_X_alerts_POST(data=gs, content_type="application/rdf+xml")
        print "Posted alert", time.time(), serialize_rdf(a_res)

if __name__ == "__main__":
    check_records()
