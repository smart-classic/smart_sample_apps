"""
utility functions for surescripts connector

Josh Mandel
joshua.mandel@childrens.harvard.edu
"""

import sys
import libxml2, libxslt
from django.conf import settings
from smart_client.smart import SmartClient

def put_ccr_to_smart(sclient, record_id, ccr_string):
    rdf_string  = xslt_ccr_to_rdf(ccr_string, sclient.stylesheet)
    print "Posting the sucker!"
    sclient.records_X_medications_POST(data=rdf_string)
    print "posted!"
    return

def xslt_ccr_to_rdf(source, stylesheet):
    sourceDOM = libxml2.parseDoc(source)
    ssDOM = libxml2.parseFile(stylesheet)
    return apply_xslt(sourceDOM, ssDOM)

def apply_xslt(sourceDOM, stylesheetDOM):
    style = libxslt.parseStylesheetDoc(stylesheetDOM)
    return style.applyStylesheet(sourceDOM, None).serialize()


def get_smart_client(resource_tokens=None):
    ret = SmartClient(settings.SS_OAUTH['consumer_key'], settings.SMART_SERVER_PARAMS, settings.SS_OAUTH, resource_tokens)
    ret.stylesheet = "%s%s"%(settings.XSLT_STYLESHEET_LOC, "ccr_to_med_rdf.xslt")
    return ret

