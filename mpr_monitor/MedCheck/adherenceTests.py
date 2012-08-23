
# Imports
import datetime
import readTable
import math
from xml.dom.minidom import parseString
#from django.conf
import settings

# Global variables
ISO_8601_DATETIME = '%Y-%m-%d'

#=#=#=#=#=#=#=#=#=#=#=#=##=#=#=#=#=#=#=#=#=#=#=#=##=#=#=#=#=#=#=#=#=#=#=#=#
"""    
File: adherenceTests.py

    Written by: William J. Bosl
    Children's Hospital Boston Informatics Program
    300 Longwood Avenue
    Boston, MA 02115

    Description: This class has functions that take a list of prescription fulfillment
    dates and does several check for medication adherence. Current tests include
		- a gap check for medication possession gaps larger than 30 days;
		- Actual Medication Possession Ratio (MPR) < 0.80
		- Predicted 1-year MPR<0.80 when less than 1 year has passed since first fill
	Other tests may be added to this list.
    The primary loop for each med has to step through time, by day, to compute the mpr at each day.
    It also keeps track of how many pills are left, how long since the first fill, and the size
    of the largest gap in adherence. Gaps are determined by noting how many days have passed and
    subtracting the number of pills that have been received. We can only assume that if a patient 
    has the pills that he or she is actually taking them.

    While stepping through the days for each pill, other tests can be implemented. At this time,
    a logistic regression test is done for certain drug classes. The list of drugs for which 
    predictions of adherence can be made are contained in the file settings.DRUGCLASSFILE. If a 
    drug is in the list, and mpr values are available at any of 60, 90, or 120 days, a logistic
    regression model is used to make a prediction. Coefficients for the model are contained in 
    the external file: settings.LOGREGFILE.

    A brief template function is included at the end that may be used to add future tests. As 
    noted, if the new test adds a new outcome option, assigned to the 'flag' variable, that
    options must also be added to index.html and risk.html so that the proper display is 
    available. 

    Currently, the 'flag' variable takes one of the following options, whose meaning is self-evident:
	 flag = "Good" (One can simply assume the mpr is above the set threshold, no gaps, no other tests failed.)           
	 flag = "Poor_gaps"            
	 flag = "Poor_lowMPR"            
	 flag = "Good_predictedMPR"            
	 flag = "Warning_predictedMPR"            
	 flag = "Warning_lowMPR"     
          
    The flag values are supposed to give some idea of the adherence level (good, poor) and the 
    reason for the value (large gaps, good or poor logistic prediction, currently low MPR if
    no prediction is available. 

    Note that the defined threshold for "good" or "poor" adherence based on mpr is contained in 
    the variable settings.GOOD_MPR_THRESHOLD and may be changed if required. Other levels, such
    as "good", "acceptable", "poor", for example, may be implemented, with corresponding flags below
    and display entries in index.html and risk.html.

    The threshold for gaps that are considered "poor" adherence is contained in settings.GAP_THRESHOLD
"""
#=#=#=#=#=#=#=#=#=#=#=#=##=#=#=#=#=#=#=#=#=#=#=#=##=#=#=#=#=#=#=#=#=#=#=#=#
class AdherenceTests():
    
    #=====================================================
    # Initialization of class variables. The primary
    # task here is to read the drug class data, once.
    #=====================================================
    def __init__(self):
		#---------------------------------------------								                        
		# Class variables
		#---------------------------------------------								                        
        self.GOOD_MPR_THRESHOLD = settings.GOOD_MPR_THRESHOLD
        self.GAP_THRESHOLD = settings.GAP_THRESHOLD
        
		#---------------------------------------------								                        
        # Get the data table from the given regression file
		#---------------------------------------------								                        
        logistic_data_file = settings.LOGREGFILE
        try:
            reader = readTable.ReadTable(logistic_data_file)
        except:
            print "Can't open file ", logistic_data_file
            return
        self.data = reader.read()        

		#---------------------------------------------								                        
		# Open and read the file containing drug class information
		#---------------------------------------------								                        
        try:
            drugclassfilename = settings.DRUGCLASSFILE
            file = open(drugclassfilename, 'r')
            allLines = file.readlines()
            file.close()
        except:
            print "Can't open file ", drugclassfilename
            return
		
		#---------------------------------------------								                        
		# Iterate through the rows, reading lines containing drugname, class
		#---------------------------------------------								                        
        self.drugclasses = {}
        for i in range(len(allLines)):
            row = allLines[i].split(',')
            self.drugclasses[row[0]] = row[1]
			
    #============================================================================================
	# This function will administer all the adherence tests. It will do this for each medication
	# that the patient is prescribed, as contained in the list patient_refill_data.
    #============================================================================================
    def allTests(self, patient_refill_data, drug, birthday):
										
        # Local variables
        model_prediction_days = [60,90,120]
        max_gap = {}
        threshold = self.GAP_THRESHOLD     # default gap threshold 
        refill_data = {}
		
		# Returned variables
        gap_flag = []
        mpr_tseries = {}
        refill_day = {}
        gaps = {}
                
		#---------------------------------------------								                        
        # Go through the list of refill data for each 
		# drug and determine which have gaps
		#---------------------------------------------								                        
        for data in patient_refill_data: 
            name = data[1]
            if drug=='all' or drug==name:
                quant = int(data[2])
                when = data[3]
                d = datetime.datetime.strptime(str(when), ISO_8601_DATETIME) 
                age_on_first_fill = {}
                                                
                # Organize all refill dates by drug name 
                max_gap[name] = 0.0
                if not refill_data.has_key(name):
                    refill_data[name] = {}
                    mpr_tseries[name] = []
                    gaps[name] = []
                    refill_day[name] = []
                refill_data[name][d] = quant
                                                                        
		#---------------------------------------------								                        
        # Check for gaps and predict adherence
		#---------------------------------------------								                        
        for name in sorted(refill_data.keys()):
            dates = refill_data[name].keys()
            npills = refill_data[name].values()
            pMPR_yesno = -1 # default value: no prediction made
            drug_class = "other"  # default            
            
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            # Sort dates and npills list 
			# together / simultaneously
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            dates, npills = zip(*sorted(zip(dates, npills)))
            nDates = len(dates)
            date0 = dates[0]
            first = date0       # This will change; it's the fill date or the day on which the 
            last = date0        # next batch of pills will start to be used.
            
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            # Determine the total length of time, in days, pills have been taken, 
            # including gaps (that is, from first day through the day when the 
            # last pill from the last prescription fill was taken.
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            nDays = 0
            for i in range(1,nDates):
                s1 = (dates[i] - dates[i-1]).days
                s2 = npills[i-1]
                if s1>s2: nDays = nDays + s1
                else: nDays = nDays + s2
            nDays = nDays + npills[nDates-1]
            
			#- - - - - - - - - - - - - - - - - - - - - 								                        
			# If the drug name is in the list of classes
			# that we used in the log regression model, and								                        
			# if the total pills for all refills is less 
			# than 1 year, make an adherence prediction
			# based on the regression model.                
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            make_prediction = False
            shortname = name.split()[0].lower()   
            if shortname in self.drugclasses.keys():
                drug_class = self.drugclasses[shortname]
                if nDays < 360: make_prediction = True
                            
            
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            # Determine the patient's age on the 
			# date of first fill for this med
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            bd = datetime.datetime.strptime(str(birthday), ISO_8601_DATETIME)
            age_on_first_fill[name] = date0 - bd      
            age = age_on_first_fill[name].days/365          # Age in years on first fill date
                                            
            mpr = 1.0
            latest_mpr = 1.0
            day = 0     # Initial fill
            pills_available = npills[0]
            total_pills_taken = 0
            days_since_initial_fill = 0
            next_refill_index = 1
            next_refill_day = 0
            if nDates > 1:
				next_refill_day = (dates[1] - date0).days
            mpr_tseries[name].append( [0, mpr] )
            refill_day[name].append([0,1.0])

			#- - - - - - - - - - - - - - - - - - - - - 	
			# Step through each day, compute MPR and
			# find gaps.							                        
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            for day in range(1, nDays+1): 
                                                                                                                                
                # Is it time for a refill? Check to see if prescription was filled
                if day == next_refill_day and next_refill_day < nDays:
                    refill_day[name].append([day,mpr])
                    pills_available += npills[next_refill_index]
                    next_refill_index += 1
                    if nDates > next_refill_index:                    
                        next_refill_day = (dates[next_refill_index] - date0).days       
                
                # Does the patient still have pills left? If so, increment
                if pills_available > 0:
                    pills_available -= 1
                    total_pills_taken += 1
                    
                # Time marches on whether or not patient has pills
                days_since_initial_fill += 1
                                
                # Compute the current mpr
                mpr = 1.0*total_pills_taken / days_since_initial_fill
				
				# If this is the last refill, check to see if we need 
				# to make an adherence prediction
                if (day in model_prediction_days) and make_prediction:
					# Record the mpr at 60, 90 and 120 days, in case we need to make a prediction  
                    pMPR_yesno = self.predict(name, age, mpr, day) 
				
                                                                                                                                                                
                # If the number of available pills is less than zero, we have a gap
                if pills_available == 0 and day < nDays:
                    mpr_tseries[name].append( "null" )
                    gaps[name].append( [day, mpr] )
                else:
                    mpr_tseries[name].append( [day, mpr] )
                    latest_mpr = mpr
                                                                                                                                           
            for i in range(1,len(dates)):
                # Get the number of pills at the last refill
                q = npills[i-1]                        
                last = dates[i]                       

				# Compute the gap and keep track of the largest gap for this drug
                gap = (dates[i] - dates[i-1]).days - q
                if gap > max_gap[name]:
                    max_gap[name] = gap
                                                                    
			#- - - - - - - - - - - - - - - - - - - - - 								                        
			# Start the various tests here
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            flag = "Good"  # default value, current MPR is good, no gaps
					
			#- - - - - - - - - - - - - - - - - - - - - 								                        
			# Gap check: If a large gap exists, 
			# there's an adherence problem. Period.
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            if max_gap[name] > 30: # self.GAP_THRESHOLD:
				flag = "Poor_gaps"
				
			#- - - - - - - - - - - - - - - - - - - - - 								                        
			# If data for 1 year or more (nominally 360 days) is available, 
			# adherence can be determined by actual MPR value
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            elif nDays >= 360 and latest_mpr < self.GOOD_MPR_THRESHOLD:
				flag = "Poor_lowMPR"
					
			#- - - - - - - - - - - - - - - - - - - - - 								                        
			# LogReg prediction test: used only if 
			# less than 1 year and prediction was made.
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            elif nDays<360 and pMPR_yesno:
				if pMPR_yesno == "Good":
					flag = "Good_predictedMPR"
				elif pMPR_yesno == "Poor":
					flag = "Warning_predictedMPR"
				elif latest_mpr < self.GOOD_MPR_THRESHOLD:
					flag = "Warning_lowMPR"
				
                            
			#- - - - - - - - - - - - - - - - - - - - - 		
			# Return all the variables needed for 
			# creating nice plots.						                        
			#- - - - - - - - - - - - - - - - - - - - - 								                        
            urlname = name.replace (" ", "%20")
            gap_flag.append([name, urlname, flag, first, last, drug_class, nDays, mpr])   
			
		# Fill in class variables needed by other functions
        return gap_flag , gaps, mpr_tseries, refill_day

    
    #=============================================================================
    # This function computes the outcome from a logistic regression 
    # solution. The coefficients from the regression were computed
    # externally and are read from a file upon initiation. Inputs
    # required for the solution are the patients age on the first
    # fill date and the MPR on day 60, 90 or 120. The return value
    # is tertiary: -1 = cannot predict (model is not valid for these parameters)
    # 0 = no adherence problem, 1 = non-adherence (mpr < 0.8) predicted
    # at 1 year from first fill.
    #=============================================================================
    def predict(self, med_name, age, mpr, iday):        

        # Initialize to null. This is the default case if none of the given
        # input parameters match the valid model parameters.
        # Some local variables
        adherence_warning = "None"   # By default, no warning is reported
        sday = str(iday)
        allowable_days = ['60', '90', '120']
                
		#- - - - - - - - - - - - - - - - - - - - - 								                        
        # Is the med_name in the list of model_class names?
		#- - - - - - - - - - - - - - - - - - - - - 								                        
        name = med_name.split()[0].lower()
                
		#- - - - - - - - - - - - - - - - - - - - - 								                        
        # Get the drug class from the drug name
		#- - - - - - - - - - - - - - - - - - - - - 								                        
        if self.drugclasses.has_key(name):
            drug_class = str(self.drugclasses[name])
        else:
            drug_class = "other"
            return adherence_warning  # no prediction
                
        if not (sday in allowable_days):
            print "day not allowable for adherence calculation"
            return adherence_warning
                
		#- - - - - - - - - - - - - - - - - - - - - 								                        
        # Set up the regression coefficients. Age must be 60, 90 or 120 days at this time.
        # print "2. med, class: ", name, drug_class
        # print "keys:", self.data.keys()
		#- - - - - - - - - - - - - - - - - - - - - 								                        
        coeff = self.data[drug_class][sday]
        a = float(coeff[0])
        b = float(coeff[1])
        c = float(coeff[2])
                
		#- - - - - - - - - - - - - - - - - - - - - 								                        
        # Compute the logit function
		#- - - - - - - - - - - - - - - - - - - - - 								                        
        g = a + b*mpr + c*age
        exp_g = math.exp(g)
        p = exp_g/(1.0 + exp_g)
		
		#- - - - - - - - - - - - - - - - - - - - - 								                        
        # Determine the meaning of the outcome and return
		#- - - - - - - - - - - - - - - - - - - - - 								                        
        if p > 0.5: adherence_warning = "Poor"
        else: adherence_warning = "Good"                                
        return adherence_warning
    
    #=====================================================
    # Template for future tests.
	# If the flag value assigned here does not have a  
	# corresponding option in index.html and risk.html, 
	# it needs to be added.
    #=====================================================
    def newTest(self):
        flag = "New_Test_MPR"
        return flag

	
