
# Imports
import datetime
import adherence_predict as adhere
from django.conf import settings
import math

# Global variables
ISO_8601_DATETIME = '%Y-%m-%d'


"""    
File: gap_check.py

    Written by: William J. Bosl
    Children's Hospital Boston Informatics Program
    300 Longwood Avenue
    Boston, MA 02115

    Description: This class has a function that takes a list of prescription fulfillment
    dates and checks for gaps larger than a specified threshold. It also calls
    the adherence prediction function. Return values include the mpr time
    series, gap check results, 1-year adherence prediction, dates of refills
    and gaps: all the variables needed for plotting.

"""
def gap_check(patient_refill_data, drug, birthday, all_drug_classes):
    
    # Local variables
    model_prediction_days = [60,90,120]
    threshold = 30     # default threshold in days
    gap_flag = []
    max_gap = {}
    refill_data = {}
    mpr_tseries = {}
    refill_day = {}
    gaps = {}
    actualMPR = {}
    logistic_data_file = settings.MEDIA_ROOT + "genLinearModel.txt"
    adherence = adhere.adherence_predict(logistic_data_file, all_drug_classes)
        
    # Go through the list of refill data for each drug and determine which have gaps
    for data in patient_refill_data: 
        #med = data[0]
        name = data[1]
        if drug=='all' or drug==name:
            quant = int(data[2])
            when = data[3]
            d = datetime.datetime.strptime(str(when), ISO_8601_DATETIME) 
            actualMPR[name] = [0.7,0.8,0.9,1.0] 
            age_on_first_fill = {}
                    
            # Organize all refill dates by drug name 
            max_gap[name] = 0.0
            if not refill_data.has_key(name):
                refill_data[name] = {}
                mpr_tseries[name] = []
                gaps[name] = []
                refill_day[name] = []
            refill_data[name][d] = quant
                    
    # Check for gaps and predict adherence
    for name in sorted(refill_data.keys()):
        dates = refill_data[name].keys()
        npills = refill_data[name].values()
        pMPR_yesno = -1 # default value: no prediction made
        
        
        # Sort dates and npills list together / simultaneously
        dates, npills = zip(*sorted(zip(dates, npills)))
        nDates = len(dates)
        date0 = dates[0]
        first = date0       # This will change; it's the fill date or the day on which the 
        last = date0        # next batch of pills will start to be used.
        
        # Determine the total length of time, in days, pills have been taken, 
        # including gaps (that is, from first day through the day when the 
        # last pill from the last prescription fill was taken.
        nDays = 0
        for i in range(1,nDates):
            s1 = (dates[i] - dates[i-1]).days
            s2 = npills[i-1]
            if s1>s2: nDays = nDays + s1
            else: nDays = nDays + s2
        nDays = nDays + npills[nDates-1]
        
        print "Drug: ", name, "; nDays = ", nDays,"; nDates = ", nDates,", lenpills = ", len(npills)

        make_prediction = False
        shortname = name.split()[0].lower()   
        if shortname in all_drug_classes.keys():
            drug_class = all_drug_classes[shortname]
            # If the total pills for all refills is less than 1 year, make an adherence
            # prediction based on the regression model.
            
            if nDays < 360: 
                make_prediction = True
        else:
            drug_class = "other"
            
        
        # Determine the patient's age on the date of first fill for this med
        bd = datetime.datetime.strptime(str(birthday), ISO_8601_DATETIME)
        age_on_first_fill[name] = date0 - bd      
        age = age_on_first_fill[name].days/365          # Age in years on first fill date
                
        mpr = 1.0
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
                pMPR_yesno = adherence.predict(name, age, mpr, day) 
                                            
            # If the number of available pills is less than zero, we have a gap
            if pills_available == 0 and day < nDays:
                mpr_tseries[name].append( "null" )
                gaps[name].append( [day, mpr] )
            else:
                mpr_tseries[name].append( [day, mpr] )
                                       
        for i in range(1,len(dates)):
            #q = refill_data[name][dates[i-1]]
            
            # Get the number of pills at the last refill
            q = npills[i-1]                        
            last = dates[i]                       
 
            gap = (dates[i] - dates[i-1]).days - q
            if gap > max_gap[name]:
                max_gap[name] = gap
                
        # flag=0: 30-day gaps; flag=1: predicted 1-year MPR<0.8;
        # flag=2: Actual 1-year MPR<0.8; flag=3: Predicted 1-year MPR>0.8;
        # flag=4: Actual 1-year MPR>0.8 
        good_threshold = 0.9
        acceptable_threshold = 0.8
        
        if max_gap[name] > threshold:   # 30-day gaps
            flag = 0
            
        elif nDays >= 360:
            if mpr >= good_threshold:
                flag = 1
            elif mpr >= acceptable_threshold:
                flag = 2
            else:
                flag = 3
                
        elif nDays < 360:
            if pMPR_yesno == -1:     # no prediction
                if mpr >= good_threshold:
                    flag = 1
                elif mpr >= acceptable_threshold:
                    flag = 2
                else:
                    flag = 3
            else:
                if pMPR_yesno == 0: # good adherence predicted
                    if mpr >= acceptable_threshold: flag = 4
                    else: flag = 5 # good predicted; current mpr is poor
                else:  
                    flag = 6    # poor predicted adherence
        
        urlname = name.replace (" ", "%20")
        gap_flag.append([name, urlname, flag, first, last, drug_class, nDays, mpr])        
                
    return gap_flag, gaps, mpr_tseries, refill_day, actualMPR

    