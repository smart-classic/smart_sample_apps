"""
Example SMArt REST Application: 

 * Required "admin" app privileges on smart container
 * Pushes data into the container using "Stage 1 Write API"

Josh Mandel
Children's Hospital Boston, 2011
"""

from smart_client.smart import SmartClient
from smart_client.common.util import *
import argparse, sys, os

# Basic configuration:  the consumer key and secret we'll use
# to OAuth-sign requests.
SMART_SERVER_OAUTH = {'consumer_key': 'smart-connector@apps.smartplatforms.org', 
                      'consumer_secret': 'smartapp-secret'}


# The SMArt contianer we're planning to talk to
SMART_SERVER_PARAMS = {
    'api_base' :          'http://localhost:7000'
}

"""Convenience function to initialize a new SmartClient"""
def get_smart_client(resource_tokens=None):
    ret = SmartClient(SMART_SERVER_OAUTH['consumer_key'], 
                       SMART_SERVER_PARAMS, 
                       SMART_SERVER_OAUTH,
                       resource_tokens)    
    return ret
