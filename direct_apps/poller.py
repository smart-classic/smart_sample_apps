import poplib, time, string, email, os, random, json, re, web
from email.parser import FeedParser
from StringIO import StringIO
from sendmail import sendEmail
from lib.html2text import html2text
from lib.smart_client.smart import SmartClient
from settings import APP_PATH, SMTP_HOST, SMTP_USER, SMTP_PASS
from settings import SMTP_HOST_ALT, SMTP_USER_ALT, SMTP_PASS_ALT 
from settings import PROXY_OAUTH, PROXY_PARAMS, BACKGROUND_OAUTH, BACKGROUND_PARAMS

def generatePIN ():
    pin = str(random.randint(1000, 9999))
    return pin

def generatePID ():
    while True:
    
        pid = str(random.randint(100000, 999999))
        print "Generated PID:", pid
    
        isUnique = True

        smart_client = SmartClient(BACKGROUND_OAUTH['consumer_key'], BACKGROUND_PARAMS, BACKGROUND_OAUTH, None)

        for record_id in smart_client.loop_over_records():
            if pid == record_id:
                print "Collision detected ... resetting PID"
                isUnique = false
                break
            
        if isUnique:
            break

    print "PID is unique - proceeding"
    return pid
    
def getAccessURL (patientID, pin):
    smart_client = SmartClient(PROXY_OAUTH['consumer_key'], PROXY_PARAMS, PROXY_OAUTH, None)
    return smart_client.get("/records/" + patientID + "/generate_direct_url", {'pin':pin})
    
def getSenderRecipient(manifestStr):
    manifest = json.loads(manifestStr)
    return [manifest['from'],manifest['to']]
    
def remove_html_tags(data):
    out = html2text (data)
    out = string.lstrip(string.rstrip (out))
    return out
    
def getUpdatedMessage(note, accessURL, manifestStr, pin):

    html = ""
    text = ""

    FILE = open(APP_PATH + 'data/apps.json', 'r')
    APPS_JSON = FILE.read()
    FILE.close()
    
    apps = json.loads(APPS_JSON)
    manifest = json.loads(manifestStr)
    myapps = [x['id'] for x in manifest['apps']]
    apps_out = [a for a in apps if a['id'] in myapps]

    template_html = web.template.frender(APP_PATH + 'templates/message-apps.html')
    template_text = web.template.frender(APP_PATH + 'templates/message-apps.txt')
    html = template_html(note, str(pin), accessURL, apps_out)
    text = template_text(remove_html_tags(note), str(pin), accessURL, apps_out)
    
    return [text,html]

def checkMail ():

    M = poplib.POP3_SSL(SMTP_HOST)
    M.user(SMTP_USER)
    M.pass_(SMTP_PASS)
    numMessages = len(M.list()[1])
    
    for i in range(numMessages):
        msg = M.retr(i+1)
        str = string.join(msg[1], "\n")
        mail = email.message_from_string(str)

        print "From:", mail["From"]
        print "Subject:", mail["Subject"]
        print "Date:", mail["Date"]

        if mail["Subject"].lower().startswith("processed:"):
        
            M.dele(i+1)
            print "Auto-response confirmation message... deleted"
            
        elif mail["Subject"].startswith("[SMART_APP]"):
        
            if mail.is_multipart():
            
                print "Message is multipart"
                for part in mail.walk():
                    c_type = part.get_content_type()
                    c_disp = part.get('Content-Disposition')

                    if c_disp != None:
                        print "attachment: ", part.get_filename()
                        if part.get_filename() == "patient.xml":
                            patientID = generatePID()
                            datafile = "p" + patientID + ".xml"
                            patientRDF_str = part.get_payload(decode=True)
                            # consider using the python tempfile library here
                            # once the import script requirement to have the patientID
                            # in the filename is relaxed
                            fp = open("temp/" + datafile, 'wb')
                            fp.write(patientRDF_str)
                            fp.close()
                        elif part.get_filename() == "manifest.json":
                            manifest = part.get_payload(decode=True)
                    elif c_type == 'text/plain' and c_disp == None:
                        mytext = part.get_payload(decode=True)
                    elif c_type == 'text/html' and c_disp == None:
                        myhtml = part.get_payload(decode=True)
                    else:
                        continue
                
                # Would be nice to improve the import script so that it could take
                # an arbitrary file and get the patientID as a separate parameter.
                # Then we won't need to encode the patientID in the filename.
                os.system("./import-patient " + APP_PATH + "temp/" + datafile)
                
                subject = mail["Subject"].replace("[SMART_APP]", "")
                pin = generatePIN()
                url = getAccessURL (patientID, pin)
                sender,recipient = getSenderRecipient(manifest)
                mytext,myhtml = getUpdatedMessage(myhtml, url, manifest, pin)
                
                sender = SMTP_USER + "@" + SMTP_HOST
                rdfbuffer = StringIO()
                rdfbuffer.write(patientRDF_str)
                attachments = [{'file_buffer': rdfbuffer, 'name': 'patient.xml', 'mime': "text/xml"}]
                settings = {'host': SMTP_HOST, 'user': SMTP_USER, 'password': SMTP_PASS}
                sendEmail (sender, recipient, subject, mytext, myhtml, attachments, settings)
                M.dele(i+1)
                rdfbuffer.close()
                print "Direct message sent to", recipient
                
            else:
                print "Message is NOT multipart... skipping"
                
        else:
            print "Message format not recognized... skipping"
        
        print "=" * 40        
    M.quit()
   
random.seed()
   
if __name__ == "__main__":
    print "Running mail poller"
    print "=" * 40
    while True:
        time.sleep (2)
        checkMail ()