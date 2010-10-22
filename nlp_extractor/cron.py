"""
Views for the Indivo Problems app

Ben Adida
ben.adida@childrens.harvard.edu
"""
from utils import get_smart_client
from smart_client.rdf_utils import *
from smart_client.smart import SmartClient
import RDF, urllib, time

def loop_over_records():
    smart_client = get_smart_client()

    for record_id in smart_client.loop_over_records():
        
        # 1. Get a list of clinical notes
        print "Getting notes ", record_id, time.time()
        notes_text = ""
        notes = smart_client.get_notes()

        # 2. Concatenate text 
        for note in notes.find_statements(
            RDF.Statement(None, 
                          RDF.Node(uri_string="http://smartplatforms.org/notes"),
                          None)):
            notes_text += "\n " + note.object.literal_value['string']
        print "got extraction corpus", notes_text, time.time()

        if (notes_text == ""): continue


        # 3. Extract medications from lumped notes
        med_list_rdf = smart_client.post("/webhook/extract_meds_from_plaintext", 
                                         notes_text, 
                                         "text/plain")
        med_list = parse_rdf(med_list_rdf)
        print "got med list", med_list_rdf

        # 4. add meds to the record
        for med in get_medication_uris(med_list):
            smart_client.put_med_helper(med_list, med, record_id)


if __name__ == "__main__":
    loop_over_records()

