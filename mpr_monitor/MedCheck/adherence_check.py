
# Imports
import gap_check as gap
from django.conf import settings
import xlrd

# Global variables
ISO_8601_DATETIME = '%Y-%m-%d'


"""    
File: adherence_check.py

    Written by: William J. Bosl
    Children's Hospital Boston Informatics Program
    300 Longwood Avenue
    Boston, MA 02115

    Description: This class has a function that takes a list of prescription fulfillment
    dates and checks for gaps larger than a specified threshold.

"""

# TODO: This needs to be re-organized. Gap check, logistic prediction should
# be called as two med adherence checks, with the possibility of adding more
# in the future.
def all_tests(patient_refill_data, drug, birthday):
    
    drug_class_data = settings.MEDIA_ROOT + "drugClass.xls"
    drugclass = get_drug_class(drug_class_data)
    gap_flag, gaps, mpr_tseries, refill_day, actualMPR = gap.gap_check(patient_refill_data, drug, birthday, drugclass)
                       
    return gap_flag, gaps, mpr_tseries, refill_day, actualMPR

def get_drug_class(drugclassfilename):
    # Connect to or read drug class information
    drugclass = {}
    wb = xlrd.open_workbook(drugclassfilename)  # Excel workbook
    sh = wb.sheet_by_index(0)                   # first sheet
    # Iterate through the rows, reading lines containing drugname, class
    for rownum in range(sh.nrows):
        row = sh.row_values(rownum) # row[0]=drugname, row[1]=class
        drugclass[row[0]] = row[1]
        
    return drugclass

        # Get the drug class information from REST calls to ndf_rt
        #base_url = 'http://rxnav.nlm.nih.gov/REST/Ndfrt'
                 
        # Request the concept number, NUI, for this drug (or "concept")
        # The NUI can be used to find other information
#        h = httplib2.Http('.cache')
#        conceptNUIrequest = base_url+"/conceptName="+med_name
#        response, content = h.request(conceptNUIrequest)
        
        # Get the NUI number from the xml string returned
#        NUI=self.getFromXML('conceptNui', content)
#        print "NUI = ", NUI
        
        # Using the NUI, find the class to which this drug belongs
        #classRequest = base_url+"/VA/"+NUI
#        classRequest = base_url+"/parentConcepts/nui="+NUI
#        response, content = h.request(classRequest)
        
#        print "status = ", response.status
#        print content  

    