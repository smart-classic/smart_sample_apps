import sys
tmp = sys.stdout
sys.stdout=sys.stderr
from smart import SmartClient

SMART_SERVER_OAUTH = {'consumer_key': 'developer-sandbox@apps.smartplatforms.org', 
                      'consumer_secret': 'smartapp-secret'}

SMART_SERVER_PARAMS = {'api_base' :          'http://sandbox-api.smartplatforms.org'}


"""An important static var"""
s = SmartClient(SMART_SERVER_OAUTH['consumer_key'], 
                       SMART_SERVER_PARAMS, 
                       SMART_SERVER_OAUTH)

import pydoc
t = pydoc.TextDoc()

sys.stdout = tmp
print t.docclass(SmartClient)
