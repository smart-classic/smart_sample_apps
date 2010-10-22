"""
utility functions for the views

Ben Adida
ben.adida@childrens.harvard.edu
"""

from xml.etree import ElementTree
import cgi
from django.conf import settings
from smart_client.smart import SmartClient

def get_smart_client(resource_tokens=None):
    ret = SmartClient(settings.NLP_OAUTH['consumer_key'], settings.SMART_SERVER_PARAMS, settings.NLP_OAUTH, resource_tokens)
    return ret


