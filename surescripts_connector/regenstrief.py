"""
Connect to the hospital API
"""

#from utils import *

import urllib2
from smart_client.common.util import get_property, sp, foaf
from django.conf import settings

class SSClient():
    def __init__(self, token_dict=None):
       # create an oauth client
        il = settings.REGENSTRIEF_SERVER_LOCATION
        self.baseURL = "%s://%s"%(il['scheme'], il['host'])

    def get_dispensed_meds(self, demographics):
        record = {}
        
        record['givenName'] = get_property(demographics, None, foaf['givenName'])      
        record['familyName'] = get_property(demographics, None, foaf['familyName'])      
        record['gender'] = get_property(demographics, None, foaf['gender'])      
        record['zipcode'] = get_property(demographics, None, sp['zipcode'])      
        record['birthday'] = get_property(demographics, None, sp['birthday'])      
        
        url = "%s/sharpAPIServer/meds/query?ln=%s&fn=%s&zipCode=%s&gender=%s&dob=%s"% (
                        self.baseURL, 
                        record['familyName'], 
                        record['givenName'], 
                        record['zipcode'], 
                        (record['gender']=='male' and "M" or "F"),
                        record['birthday'][0:4]+record['birthday'][5:7]+record['birthday'][8:10]) 
        print "requesting RI url", url
        request = urllib2.Request(url)
        ret =  urllib2.urlopen(request).read()
        print "Got", ret
        return ret
