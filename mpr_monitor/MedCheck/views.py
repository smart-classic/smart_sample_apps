"""
    File: views.py
    
    Author: William J. Bosl
    Children's Hospital Boston
    300 Longwood Avenue
    Boston, MA 02115
    Email: william.bosl@childrens.harvard.edu
    Web: http://chip.org

    Copyright (C) 2011 William Bosl, Children's Hospital Boston Informatics Program (CHIP)
    http://chip.org. 

    Purpose:
    
    This file is part of a Django-based SMArt application that implements
    a two-step test for medication adherence. It is intended to be used as
    a SMArt web application within the context of a SMArt container. See
    http://www.smartplatforms.org/ for detailed information about SMArt applications.
        
    License information should go here.

    $Log: views.py,v $
"""
from django.http import HttpResponse
from django.template import Context
from django.template.loader import get_template
from django.template import RequestContext
from django.utils import simplejson 
from django.shortcuts import render_to_response, redirect

import ast
import datetime
import logging
import urllib
import mpr_monitor.settings as settings
import adherenceTests
from smart_client.client import SMARTClient
logging.basicConfig(level=logging.DEBUG)  # cf. .INFO or commented out

# SMART Container OAuth Endpoint Configuration
_ENDPOINT = {
    "url": "http://localhost:7000",
    "name": "SMART Sandbox API v0.6",
    "app_id": "mpr-monitor@apps.smartplatforms.org",
    "consumer_key": "mpr-monitor@apps.smartplatforms.org",
    "consumer_secret": "smartapp-secret"
}

# Global variables
ISO_8601_DATETIME = '%Y-%m-%d'
last_pill_dates = {}
Global_PATIENT_ID = 0
Global_ADHERE_VARS = 0

#===========================================
# The index page is the generally the first
# page to appear when the application is started.
#===========================================
def index(request):
    indexpage = get_template('index.html')
	
	# Declare global variables that may be modified here
    global Global_PATIENT_ID 
    global Global_ADHERE_VARS 
    args_record_id = request.GET.get('record_id')
    current_record_id = request.COOKIES.get('record_id')
    record_change_p = False

    # have we changed records?
    if current_record_id != args_record_id:
        record_change_p = True
        patientID = args_record_id
    else:
        patientID = current_record_id

    client = get_smart_client(patientID)

    # do we already have an acc_token?
    acc_token = request.COOKIES.get('acc_token')
    logging.debug('acc_token is: ' + str(acc_token))

    if not acc_token or record_change_p:
        req_token = client.fetch_request_token()
        logging.debug("Redirecting to authorize url")
        response = redirect(client.auth_redirect_url)
        response.set_cookie('record_id', patientID, 600) 
        logging.debug('req_token cookie is: ' + str(request.COOKIES.get('req_token')))
        logging.debug('setting              : ' + str(req_token))

        response.set_cookie('req_token', req_token, 60) 
        response.set_cookie('acc_token', '', 60) 
        return response
    else:
        client.update_token(ast.literal_eval(acc_token))
	 
            
    # Get the medication list for this context
    # Note the general pattern: GET /records/{record_id}/medications/
    medications = client.get_medications().graph
    query = """
        PREFIX dcterms:<http://purl.org/dc/terms/>
        PREFIX sp:<http://smartplatforms.org/terms#>
        PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT  ?med ?name ?quant ?when
        WHERE {
            ?med rdf:type sp:Medication .
            ?med sp:drugName ?medc.
            ?medc dcterms:title ?name.
            ?med sp:fulfillment ?fill.
            ?fill sp:dispenseDaysSupply ?quant.
            ?fill dcterms:date ?when.
       }
       """
       
    pills = medications.query(query)
    birthday, patient_name = get_birthday_name(client)
    drug = 'all'
    
    # We only want to call the adherence_check once for a specific patient
    if Global_PATIENT_ID == patientID:
        meds_flags, gaps, refill_data, refill_day = Global_ADHERE_VARS
    else:
        tests = adherenceTests.AdherenceTests()
        meds_flags, gaps, refill_data, refill_day = tests.allTests(pills, drug, birthday)		
        Global_ADHERE_VARS = [meds_flags, gaps, refill_data, refill_day]  # save the data for future needs
        Global_PATIENT_ID = patientID
        
	# Medication information will be displayed by drug class. Here we
	# sort all the patient's medications into drug classes defined
	# in this application.
    drug_class_array = {}
    for n in range(len(meds_flags)):
        drug_class_array[meds_flags[n][5]] = 1
    sorted_drug_class_list = sorted(drug_class_array.keys())
                  
	# Send these variables to the page for rendering
    variables = Context({
        'head_title': u'Medication Adherence Monitor',
        'patientID': patientID,
        'meds_flags': meds_flags,			# Contains all the data needed for tables and plotting 
        'media_root': settings.MEDIA_ROOT,
        'patient_name': patient_name,
        'drug_class_array': sorted_drug_class_list,
    })
    output = indexpage.render(variables)
    response = HttpResponse(output)
    response.set_cookie('record_id', patientID, 600) 
    return response

def authorize(request):
    """ Extract the oauth_verifier and exchange it for an access token. """

    oauth_token = request.GET.get('oauth_token')
    oauth_verifier = request.GET.get('oauth_verifier')
    record_id = request.COOKIES.get('record_id')
    req_token = ast.literal_eval(request.COOKIES.get('req_token'))
    assert oauth_token and record_id and req_token
    assert oauth_token == req_token.get('oauth_token')

    # exchange req_token for acc_token
    client = get_smart_client(record_id)
    client.update_token(req_token)

    try:
        acc_token = client.exchange_token(oauth_verifier)
    except Exception as e:
        logging.critical("Token exchange failed: %s" % e)
        return 

    # success, store it!
    logging.debug("Exchanged req_token for acc_token: %s" % acc_token)
    response = redirect('/smartapp/index.html?api_base=%s&record_id=%s' %
                          (_ENDPOINT.get('url'),
                           record_id))
    response.set_cookie('acc_token', acc_token, 600)
    return response

#===================================================
# Creates data and serves information about 
# adherence for specific medications.
#===================================================
def risk(request):
    """ This function creates data and serves detailed  
    information about adherence for specific medications."""
	
	# Declare global variables that may be modified here
    global Global_PATIENT_ID 
    global Global_ADHERE_VARS 
	
    # Get the name of the drug if a specific one was requested.
    # The default is 'all' drugs.
    drug = request.GET.get('drug', 'all')
       
    # Current context information
    client = get_smart_client(request.COOKIES.get('record_id'))
           
    # Get the medication list for this context
    medications = client.get_medications().graph
    query = """
        PREFIX dcterms:<http://purl.org/dc/terms/>
        PREFIX sp:<http://smartplatforms.org/terms#>
        PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT  ?med ?name ?quant ?when
        WHERE {
            ?med rdf:type sp:Medication .
            ?med sp:drugName ?medc.
            ?medc dcterms:title ?name.
            ?med sp:fulfillment ?fill.
            ?fill sp:dispenseDaysSupply ?quant.
            ?fill dcterms:date ?when.
       }
       """    
    pills = medications.query(query)
    
    # The the fulfillment gap and MPR prediction data    
    meds_flags, gaps, refill_data, refill_day = Global_ADHERE_VARS

    names = []
    if drug == 'all':   # get all the drugs for this patient
        for pill in pills: 
            name = pill[1]
            names.append(name)
            d = pill[3]
    else: # only use the specified drug name
        meds_flags_new = []
        names.append(drug)      
        for item in meds_flags:
            if drug == item[0]:
                meds_flags_new.append(item)
        meds_flags = meds_flags_new 
                
    ad_data = []
    med_names = []

    for n in names:
        d = {}
        d["title"] = str(n)
        med_names.append(n)
        d["subtitle"] = 'adherence'
        d["measures"] = [1.0]
        ad_data.append(d)
           
    drug_class_array = {}
    for n in range(len(meds_flags)):
        drug_class_array[meds_flags[n][5]] = 1
    sorted_drug_class_array = sorted(drug_class_array.keys())
                            
    # Determine width and height of chart by the number of drugs to be shown
    width = 400
    height = 100
    if len(names) == 1:
        width = 500
        height = 200
    
    variables = RequestContext(request, {
                'head_title': u'Predicted 1-year medication possession ratio (MPR)',
                'med_names': med_names,
                'meds_flags': meds_flags,
                'refill_day': simplejson.dumps(refill_day),
                'refill': simplejson.dumps(refill_data),
                'gaps': simplejson.dumps(gaps),
                'width': width,
                'height': height,
                'drug_class_array': sorted_drug_class_array,
                })     
    response = render_to_response("risk.html", context_instance=variables )
    return HttpResponse(response)

#===================================================
# Page to display information about the MPR
# Monitor app.
#===================================================
def about(request):
    """ This function creates a page with information about the MPR Monitor app."""
	
    page = get_template('about.html')
    client = get_smart_client(request.COOKIES.get('record_id'))
    variables = Context({ })
    output = page.render(variables)
    return HttpResponse(output)

#===================================================
# This function creates a page that gives instructions
# for using the MPR Monitor app.
#===================================================
def choose_med(request):
    """ This function creates a page with instructions for the MPR Monitor app."""

    page = get_template('choose_med.html')
    client = get_smart_client(request.COOKIES.get('record_id'))
    variables = Context({ })
	# Render the page
    output = page.render(variables)
    return HttpResponse(output)
	
#===================================================
# Convenience function to get oa_params and ret
# variables from the SmartClient and return them.
#===================================================
def get_smart_client(record_id):
    """ Initialize a new SmartClient and return it """

    try:
        client = SMARTClient(_ENDPOINT.get('app_id'),
                             _ENDPOINT.get('url'),
                             _ENDPOINT)
    except Exception as e:
        logging.critical('Could not init SMARTClient: %s' % e)
        return

    client.record_id = record_id
    return client

#===================================================
# Function to get birthday and patient name from
# the client records and return them.
#===================================================
def get_birthday_name(client):
    """Function to get birthday and patient name from the client records and return them."""
	    
    demographics = client.get_demographics().graph
        
    query_demo = """
        PREFIX foaf:<http://xmlns.com/foaf/0.1/>
        PREFIX v:<http://www.w3.org/2006/vcard/ns#>
        PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT  ?firstname ?lastname ?gender ?birthday
        WHERE {
               ?r v:n ?n .
               ?n rdf:type v:Name .
               ?n v:given-name ?firstname .
               ?n v:family-name ?lastname .
               ?r foaf:gender ?gender .
               ?r v:bday ?birthday .
        }
        """       
  
    # Get the birthday 
    demo = demographics.query(query_demo)
    for d in demo:
        patient_name = d[0] + " " + d[1]
        birthday = d[3]
        
    return birthday, patient_name
