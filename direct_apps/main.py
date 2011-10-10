import json, string, web, urllib, rdflib

from lib.smart_client import oauth
from lib.smart_client.smart import SmartClient
from lib.smart_client.common import rdf_ontology

from StringIO import StringIO
from sendmail import sendEmail
from pdf_writer import generatePDF
from lib.markdown2 import markdown
from settings import APP_PATH, SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_HOST_ALT, SMTP_USER_ALT, SMTP_PASS_ALT, PROXY_OAUTH, PROXY_PARAMS

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
        smart_client = get_smart_client()
        meds = smart_client.records_X_medications_GET()
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
        
        out = []

        for pill in pills:
            out.append ({'drug': pill})

        return json.dumps(out)
        
class getproblems:
    def GET(self):
        smart_client = get_smart_client()
        problems = smart_client.records_X_problems_GET()
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
        
        out = []

        for problem in problems:
            out.append ({'problem': str(problem[0]), 'date': str(problem[1])})
        
        return json.dumps(out)
        
class getrecepients:
    def GET(self):
        f = open(APP_PATH + 'data/addresses.json', 'r')
        res = f.read()
        f.close()
        return res
        
class getapps:
    def GET(self):
        #smart_client = SmartClient(PROXY_OAUTH['consumer_key'], PROXY_PARAMS, PROXY_OAUTH, None)
        #apps_json = smart_client.get("/apps/manifests/")
        #apps = json.loads(apps_json)
        #apps = sorted(apps, key=lambda app: app['name'])
        #return json.dumps(apps)
        f = open(APP_PATH + 'data/apps.json', 'r')
        res = f.read()
        f.close()
        return res
        
class getdemographics:
    def GET(self):
        smart_client = get_smart_client()
        demographics = smart_client.records_X_demographics_GET()
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
        assert len(name) == 1, "Bad demographics RDF"
        n = list(name)[0]
        out = {'firstname': str(n[0]), 'lastname': str(n[1]), 'gender': str(n[2]), 'birthday': str(n[3])}
        return json.dumps(out)

class getuser:
    def GET(self):
        smart_client = get_smart_client()
        user = smart_client.users_X_GET()
        
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
        assert len(name) == 1, "Bad user RDF"
        n = list(name)[0]
        out = {'name': str(n[0]) + ' ' + str(n[1]), 'email': str(n[2]).replace("mailto:","")}
        return json.dumps(out)
 
class sendmail_msg:
    def POST(self):            
        me = SMTP_USER + "@" + SMTP_HOST #web.input().sender_email
        you = web.input().recipient_email
        subject = web.input().subject
        message = web.input().message
   
        # Create the body of the message (plain-text and HTML version).
        text = message
        html = markdown(text)
        
        pdf_buffer = generatePDF (html)
        attachments = [{'file_buffer': generatePDF(html), 'name': "patient.pdf", 'mime': "application/pdf"}]
        settings = {'host': SMTP_HOST, 'user': SMTP_USER, 'password': SMTP_PASS}
        sendEmail (me, you, subject, text, html, attachments, settings)
        pdf_buffer.close()
        
        return json.dumps({'result': 'ok'})
 
class sendmail_apps:
    def POST(self):
        smart_client = get_smart_client()

        sender = web.input().sender_email
        recipient = web.input().recipient_email
        subject = web.input().subject
        message = web.input().message
        apps = string.split (web.input().apps, ",")
        apis = []
    
        # Email addresses
        me = SMTP_USER_ALT + "@" + SMTP_HOST_ALT
        you = SMTP_USER + "@" + SMTP_HOST
        
        FILE = open(APP_PATH + 'data/apps.json', 'r')
        APPS_JSON = FILE.read()
        FILE.close()
        
        myapps = json.loads(APPS_JSON)
        manifest= {"from": sender,
                   "to": recipient,
                   "apps": []}
        
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
        
        #output patient record 
        demographics = smart_client.records_X_demographics_GET()
        rdfres = demographics
        
        if ("problems" in apis):
            rdfres += smart_client.records_X_problems_GET()
            
        if ("medications" in apis):
            rdfres += smart_client.records_X_medications_GET()
            
        if ("vital_signs" in apis):
            rdfres += smart_client.records_X_vital_signs_GET() 
        
        for t in rdf_ontology.api_types:
            if t.is_statement or t.uri == rdf_ontology.sp.MedicalRecord:
                for q in rdfres.triples((None,rdf_ontology.rdf.type,t.uri)):
                    rdf_ontology.remap_node(rdfres, q[0], rdflib.BNode())
        
        rdftext = rdfres.serialize()
        
        rdfbuffer = StringIO()
        rdfbuffer.write(rdftext)
        
        manifestbuffer = StringIO()
        manifestbuffer.write(manifesttxt)
        
        attachments = [
            {'file_buffer': rdfbuffer, 'name': "patient.xml", 'mime': "text/xml"},
            {'file_buffer': manifestbuffer, 'name': "manifest.json", 'mime': "text/xml"}
        ]
        settings = {'host': SMTP_HOST_ALT, 'user': SMTP_USER_ALT, 'password': SMTP_PASS_ALT}
        sendEmail (me, you, subject, message, message, attachments, settings)
        manifestbuffer.close()
        rdfbuffer.close()
        return json.dumps({'result': 'ok'})
        
def get_smart_client():
    smart_oauth_header = web.input().oauth_header
    smart_oauth_header = urllib.unquote(smart_oauth_header)
    oa_params = oauth.parse_header(smart_oauth_header)
    SMART_SERVER_PARAMS['api_base'] = oa_params['smart_container_api_base']
    SMART_SERVER_OAUTH['consumer_key'] = oa_params['smart_app_id']

    oa_params = oauth.parse_header(smart_oauth_header)
    
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

#if web.config.get('_session') is None:
#    session = web.session.Session(app, web.session.DiskStore('sessions'), initializer={'client': None})
#    session = web.session.Session(app, web.session.ShelfStore(shelve.open(APP_PATH+'session.shelf')), initializer={'client': None, 'cookie_name': ''})
#    web.config._session = session
#else:
#    session = web.config._session
    
if __name__ == "__main__":
    app.run()
else:
    application = app.wsgifunc()
