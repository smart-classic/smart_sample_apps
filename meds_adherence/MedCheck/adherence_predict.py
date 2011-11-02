
# Imports
import readTable
import math
from xml.dom.minidom import parseString

# Global variables
ISO_8601_DATETIME = '%Y-%m-%d'

"""    
File: adherence_predict.py

    Written by: William J. Bosl
    Children's Hospital Boston Informatics Program
    300 Longwood Avenue
    Boston, MA 02115

    Description: This function takes predicts whether the medication 
    
    a list of prescription fulfillment
    dates, patient age on the date of first fullfillment and the .

"""
class adherence_predict():
    
    def __init__(self, modelfilename, drugclasses):
        
        # Get the data table from the given regression file
        try:
            reader = readTable.readTable(modelfilename)
            print "read from: ", modelfilename
        except:
            print "Can't open file ", modelfilename
            return
        self.data = reader.read()        
        self.drugclasses = drugclasses

    
    # This function computes the outcome from a logistic regression 
    # solution. The coefficients from the regression were computed
    # externally and are read from a file upon initiation. Inputs
    # required for the solution are the patients age on the first
    # fill date and the MPR on day 60, 90 or 120. The return value
    # is binary: 0 = no problem, 1 = non-adherence (mpr < 0.8) predicted
    # at 1 year from first fill.
    def predict(self, med_name, age, mpr, iday):
        
        # Initialize to null. This is the default case if none of the given
        # input parameters match the valid model parameters.
        # Some local variables
        adherence_warning = 0   # By default, no warning is reported
        sday = str(iday)
        allowable_days = ['60', '90', '120']
        
        # Get the drug class from the drug name
        
        # Is the med_name in the list of model_class names?
        name = med_name.split()[0].lower()
        
        #print "Prediction name :", name
        
        if self.drugclasses.has_key(name):
            drug_class = str(self.drugclasses[name])
        else:
            drug_class = "other"
            return -1  # no prediction
                
        if not (sday in allowable_days):
            print "day not allowable for adherence calculation"
            return adherence_warning
                
        # Set up the regression coefficients. Age must be 60, 90 or 120 days
        # at this time.
        #print "2. med, class: ", name, drug_class
        #print "keys:", self.data.keys()
        coeff = self.data[drug_class][sday]
        a = float(coeff[0])
        b = float(coeff[1])
        c = float(coeff[2])
                
        # Compute the logit function
        g = a + b*mpr + c*age
        exp_g = math.exp(g)
        p = exp_g/(1.0 + exp_g)
        if p > 0.5: adherence_warning = 1
                                
        return adherence_warning
    