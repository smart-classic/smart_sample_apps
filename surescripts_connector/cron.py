"""
Views for the Indivo Problems app

Ben Adida
ben.adida@childrens.harvard.edu
"""
from smart_client.oauth import *
from utils import *
from regenstrief import SSClient
from smart_client.smart import SmartClient
from xml.dom.minidom import parse, parseString
import sys, time
from smart_client.rdf_utils import *

def sync_regenstrief():
    regenstrief_client = SSClient()
    smart_client = get_smart_client()

    for record_id in smart_client.loop_over_records():
        if (record_id[0] != "2"): 
            print "not a SS patient"
            continue
        print "Getting CCR ", record_id, time.time()
        d = smart_client.get_demographics()
        dispensed_ccr =  regenstrief_client.get_dispensed_meds(d)
        print "Got CCR: ", time.time()
        
        put = smart_client.put_ccr_to_smart(record_id, dispensed_ccr)
        print "put is ", put

if __name__ == "__main__":
    sync_regenstrief()
  
