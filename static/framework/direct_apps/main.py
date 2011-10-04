import sys, os, time, re, random, json, string, web, urllib, datetime, cgi, shelve, rdflib
abspath = os.path.dirname(__file__)
sys.path.append(abspath)

from lib.smart_client import oauth
from lib.smart_client.smart import SmartClient
from lib.smart_client.common import rdf_ontology

from sendmail import sendEmail
from pdf_writer import writePDF
from lib.markdown2 import markdown
from settings import APP_PATH, SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_HOST_ALT, SMTP_USER_ALT, SMTP_PASS_ALT

SMART_SERVER_OAUTH = {
#    'consumer_key': 
    'consumer_secret': 'smartapp-secret'
}

SMART_SERVER_PARAMS = {
#    'api_base': 
}

urls = ('/smartapp/index.html', 'index_apps',
        '/smartapp/index-msg.html', 'index_msg',
        '/smartapp/index-apps.html', 'index_apps',
        '/smartapp/getapps', 'getapps',
        '/smartapp/getmeds', 'getmeds',
        '/smartapp/getproblems', 'getproblems',
        '/smartapp/getrecepients', 'getrecepients',
        '/smartapp/getdemographics', 'getdemographics',
        '/smartapp/getuser', 'getuser',
        '/smartapp/sendmail-msg', 'sendmail_msg',
        '/smartapp/sendmail-apps', 'sendmail_apps')

class index_msg:
    def GET(self):
        f = open(APP_PATH + 'templates/index-msg.html', 'r')
        html = f.read()
        f.close()
        return html
        
class index_apps:
    def GET(self):
        f = open(APP_PATH + 'templates/index-apps.html', 'r')
        html = f.read()
        f.close()
        return html
        
class getmeds:
    def GET(self):
        init_smart_client()
        meds = session.client.records_X_medications_GET()
        q = """
            PREFIX dc:<http://purl.org/dc/elements/1.1/>
            PREFIX dcterms:<http://purl.org/dc/terms/>
            PREFIX sp:<http://smartplatforms.org/terms#>
            PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
               SELECT  ?name
               WHERE {
                      ?med rdf:type sp:Medication .
                      ?med sp:drugName ?medc.
                      ?medc dcterms:title ?name.
               }
            """
        pills = meds.query(q)
        
        out = "["

        first = True
        for pill in pills:
            if not first:
                out +=','
            else:
                first = False
            out += '{"drug": "' + pill + '"}'
            
        out += "]"
        
        return out
        
class getproblems:
    def GET(self):
        init_smart_client()
        problems = session.client.records_X_problems_GET()
        q = """
            PREFIX dc:<http://purl.org/dc/elements/1.1/>
            PREFIX dcterms:<http://purl.org/dc/terms/>
            PREFIX sp:<http://smartplatforms.org/terms#>
            PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
               SELECT  ?name ?date
               WHERE {
                      ?p rdf:type sp:Problem .
                      ?p sp:startDate ?date.
                      ?p sp:problemName ?pn.
                      ?pn dcterms:title ?name.
               }
            """
            
        problems = problems.query(q)
        
        out = "["

        first = True
        for problem in problems:
            if not first:
                out +=','
            else:
                first = False
            out += '{"problem": "' + str(problem[0]) + '", "date":"' + str(problem[1]) + '"}'
            
        out += "]"
        
        return out
        
class getrecepients:
    def GET(self):
        f = open(APP_PATH + 'data/addresses.json', 'r')
        res = f.read()
        f.close()
        return res
        
class getapps:
    def GET(self):
        f = open(APP_PATH + 'data/apps.json', 'r')
        apps = f.read()
        f.close()
        return apps
        
class getdemographics:
    def GET(self):
        init_smart_client()
        demographics = session.client.records_X_demographics_GET()
        q = """
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
        name = demographics.query(q)
        for n in name:
            return '{"firstname": "' + str(n[0]) + '", "lastname": "' + str(n[1]) + '", "gender": "' + str(n[2]) + '", "birthday": "' + str(n[3]) + '"}'
        
class getuser:
    def GET(self):
        init_smart_client()
        user = session.client.users_X_GET()
        
        q = """
            PREFIX foaf:<http://xmlns.com/foaf/0.1/> 
            PREFIX sp:<http://smartplatforms.org/terms#>
            PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            SELECT  ?firstname ?lastname ?email
            WHERE {
               ?r foaf:givenName ?firstname .
               ?r foaf:familyName ?lastname .
               ?r foaf:mbox ?email .
            }
            """       
        name = user.query(q)
        for n in name:
            # Consider using "assert len(name) == 1" here
            return '{"name": "' + str(n[0]) + ' ' + str(n[1]) + '", "email": "' +  str(n[2]).replace("mailto:","") + '"}'
 
class sendmail_msg:
    def POST(self):            
        me = SMTP_USER + "@" + SMTP_HOST #web.input().sender_email
        you = web.input().recipient_email
        subject = web.input().subject
        message = web.input().message
        stamp = str(time.time())  #format it as something more comprehensible
        filename = "patient-" + stamp + ".pdf" 
        attachments = [{'file': filename, 'name': "patient.pdf", 'mime': "application/pdf"}]
        settings = {'host': SMTP_HOST, 'user': SMTP_USER, 'password': SMTP_PASS}

        # Create the body of the message (plain-text and HTML version).
        text = message
        html = markdown(text)
        
        writePDF (APP_PATH + "temp/" + filename, html)
        sendEmail (me, you, subject, text, html, attachments, settings)
        return '{"result": "ok"}'
 
class sendmail_apps:
    def POST(self):
        init_smart_client()

        sender = web.input().sender_email
        recipient = web.input().recipient_email
        subject = web.input().subject
        message = web.input().message
        settings = {'host': SMTP_HOST_ALT, 'user': SMTP_USER_ALT, 'password': SMTP_PASS_ALT}
        apps = string.split (web.input().apps, ",")
        apis = []
        
        random.seed()
        serial = str(random.randint(100000, 999999))
        filename1 = "p" + serial + ".xml"
        filename2 = "manifest-" + serial + ".json"
        attachments = [{'file': filename1, 'name': filename1, 'mime': "text/xml"},
                       {'file': filename2, 'name': filename2, 'mime': "text/xml"}]
    
        # Email addresses
        me = SMTP_USER_ALT + "@" + SMTP_HOST_ALT
        you = SMTP_USER + "@" + SMTP_HOST
        
        FILE = open(APP_PATH + 'data/apps.json', 'r')
        APPS_JSON = FILE.read()
        FILE.close()
        
        apps_obj = json.loads(APPS_JSON)
        manifest= {"from": sender,
                   "to": recipient,
                   "datafile": filename1,
                   "apps": []}
        
        myapps = apps_obj['apps']
        
        for a in myapps:
            if (a['id'] in apps):
                myapis = a['apis']
                for i in myapis:
                    if (i not in apis):
                        apis.append(i)
                del(a['apis'])
                del(a['name'])
                del(a['icon'])
                manifest["apps"].append(a)
        
        manifesttxt = json.dumps(manifest)
        
        FILE = open(APP_PATH + "temp/" + filename2,"w")
        FILE.write(manifesttxt)
        FILE.close()
        
        #output patient record 
        demographics = session.client.records_X_demographics_GET()
        rdfres = demographics
        
        if ("problems" in apis):
            problems = session.client.records_X_problems_GET()
            rdfres += problems
            
        if ("medications" in apis):
            meds = session.client.records_X_medications_GET()
            rdfres += meds
            
        if ("vital_signs" in apis):
            vitals = session.client.records_X_vital_signs_GET() 
            rdfres += vitals
        
        for t in rdf_ontology.api_types:
            if t.is_statement or t.uri == rdf_ontology.sp.MedicalRecord:
                for q in rdfres.triples((None,rdf_ontology.rdf.type,t.uri)):
                    rdf_ontology.remap_node(rdfres, q[0], rdflib.BNode())
        
        #rdftext = rdfres.serialize(format="pretty-xml")
        #rdftext = re.sub(r'\srdf:about\=\"([\w\s\-\#\:\.\/]*)\"',"",rdftext)
        
        rdftext = rdfres.serialize()
        
        FILE = open(APP_PATH + "temp/" + filename1,"w")
        FILE.write(rdftext)
        FILE.close()
        
        sendEmail (me, you, subject, message, message, attachments, settings)
        return '{"result": "ok"}'

def init_smart_client():
    #cookie_name = "tetwfsg"
    
    #session.client = None
    #session.cookie_name = "None"
    #if session.client is None or cookie_name != session.cookie_name:
        smart_oauth_header = web.input().oauth_header
        smart_oauth_header = urllib.unquote(smart_oauth_header)
        oa_params = oauth.parse_header(smart_oauth_header)
        SMART_SERVER_PARAMS['api_base'] = oa_params['smart_container_api_base']
        SMART_SERVER_OAUTH['consumer_key'] = oa_params['smart_app_id']
        session.client = get_smart_client(smart_oauth_header)
        #session.cookie_name = cookie_name  
        
def get_smart_client(authorization_header, resource_tokens=None):
    oa_params = oauth.parse_header(authorization_header)
    
    resource_tokens={'oauth_token':       oa_params['smart_oauth_token'],
                     'oauth_token_secret':oa_params['smart_oauth_token_secret']}

    ret = SmartClient(SMART_SERVER_OAUTH['consumer_key'], 
                       SMART_SERVER_PARAMS, 
                       SMART_SERVER_OAUTH, 
                       resource_tokens)
    
    ret.record_id=oa_params['smart_record_id']
    ret.user_id=oa_params['smart_user_id']
    return ret

web.config.debug=False
app = web.application(urls, globals())
if web.config.get('_session') is None:
    #session = web.session.Session(app, web.session.DiskStore('sessions'), initializer={'client': None})
    session = web.session.Session(app, web.session.ShelfStore(shelve.open(APP_PATH+'session.shelf')), initializer={'clients': None, 'cookie_name': ''})
    session.client = None    
    web.config._session = session
else:
    session = web.config._session
    
if __name__ == "__main__":
    app.run()
else:
    application = app.wsgifunc()
