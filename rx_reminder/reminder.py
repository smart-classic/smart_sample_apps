"""
Example SMArt REST Application: Parses OAuth tokens from
browser-supplied cookie, then provides a list of which prescriptions
will need to be refilled soon (based on dispense day's supply + date).

Josh Mandel
Children's Hospital Boston, 2010
"""
import sys, os
abspath = os.path.dirname(__file__)
sys.path.append(abspath)

import web,  urllib
import datetime
import smart_client
from smart_client import oauth
from smart_client.smart import SmartClient
from smart_client.common.rdf_tools.util import serialize_rdf

# Basic configuration:  the consumer key and secret we'll use
# to OAuth-sign requests.
SMART_SERVER_OAUTH = {
#    'consumer_key': will fill this in later, based on incoming request
    'consumer_secret': 'smartapp-secret'
}


# The SMArt contianer we're planning to talk to
SMART_SERVER_PARAMS = {
#    'api_base': will fill this in later, based on incoming request
}


"""
 A SMArt app serves at least two URLs: 
   * "bootstrap.html" page to load the client library
   * "index.html" page to supply the UI.
"""
urls = ('/smartapp/index.html',     'RxReminder')


# Exposes pages through web.py
class RxReminder:

    """An SMArt REST App start page"""
    def GET(self):
        # Obtain the oauth header
        try:
            smart_oauth_header = web.input().oauth_header
            smart_oauth_header = urllib.unquote(smart_oauth_header)
        except:
            return "Couldn't find a parameter to match the name 'oauth_header'"
        
        # Pull out OAuth params from the header
        oa_params = oauth.parse_header(smart_oauth_header)

        # This is how we know...
        # 1. what container we're talking to
        try:
            SMART_SERVER_PARAMS['api_base'] = oa_params['smart_container_api_base']
        except: return "Couldn't find 'smart_contianer_api_base' in %s"%smart_oauth_header

        # 2. what our app ID is
        try:
            SMART_SERVER_OAUTH['consumer_key'] = oa_params['smart_app_id']
        except: return "Couldn't find 'smart_app_id' in %s"%smart_oauth_header

        # (For demo purposes, we're assuming a hard-coded consumer secret, but 
        #  in real life we'd look this up in some config or DB now...)
        client = get_smart_client(smart_oauth_header)

        # Represent the list as an RDF graph
        meds = client.get_medications()

        # Find a list of all fulfillments for each med.
        q = """
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
        pills = meds.graph.query(q)

        # Find the last fulfillment date for each medication
        self.last_pill_dates = {}

        for pill in pills:
            self.update_pill_dates(*pill)

        #Print a formatted list
        return header + self.format_last_dates() + footer

    def update_pill_dates(self, med, name, quant, when):        
        ISO_8601_DATETIME = '%Y-%m-%d'
        def runs_out():
            print>>sys.stderr, "Date", when
            s = datetime.datetime.strptime(str(when), ISO_8601_DATETIME)
            s += datetime.timedelta(days=int(float(str(quant))))
            return s

        r = runs_out()
        previous_value = self.last_pill_dates.setdefault(name, r)
        if r > previous_value:
            self.last_pill_dates[name] = r


    def format_last_dates(self):
        ret = ""
        for (medname, day) in self.last_pill_dates.iteritems():
            late = ""
            if day < datetime.datetime.today(): 
                late = "<i>LATE!</i> "
            ret += late+str(medname)+ ": <b>" + day.isoformat()[:10]+"</b><br>"

        if (ret == ""): return "Up to date on all meds."
        ret =  "Refills due!<br><br>" + ret
        return ret


header = """<!DOCTYPE html>
<html>
  <head>                     <script src="http://sample-apps.smartplatforms.org/framework/smart/scripts/smart-api-client.js"></script></head>
  <body>
"""

footer = """
</body>
</html>"""


"""Convenience function to initialize a new SmartClient"""
def get_smart_client(authorization_header, resource_tokens=None):
    oa_params = oauth.parse_header(authorization_header)
    
    resource_tokens={'oauth_token':       oa_params['smart_oauth_token'],
                     'oauth_token_secret':oa_params['smart_oauth_token_secret']}

    ret = SmartClient(SMART_SERVER_OAUTH['consumer_key'], 
                       SMART_SERVER_PARAMS, 
                       SMART_SERVER_OAUTH, 
                       resource_tokens)
    
    ret.record_id=oa_params['smart_record_id']
    return ret

app = web.application(urls, globals())
web.config.debug=True
if __name__ == "__main__":
    app.run()
else:
    application = app.wsgifunc()
