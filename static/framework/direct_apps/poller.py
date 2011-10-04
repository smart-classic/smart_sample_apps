import poplib, time, string, email, os, random, json, urllib, re
from email.parser import FeedParser
from string import Template
from sendmail import sendEmail
from settings import APP_PATH, SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_HOST_ALT, SMTP_USER_ALT, SMTP_PASS_ALT

def generatePIN ():
    pin = random.randint(1000, 9999)
    return pin

def getAccessURL (patientID, pin):
    getURL = "http://direct.smartplatforms.org:7000/records/" + str(patientID) + "/generate_direct_url?pin=" + str(pin)
    f = urllib.urlopen(getURL)
    url = f.read()
    f.close()
    return url

def getSenderRecipient(manifestStr):
    manifest = json.loads(manifestStr)
    return [manifest['from'],manifest['to']]
    
def remove_html_tags(data):
    # need to use an html-to-text conversion library here!
    p = re.compile(r'<.*?>')
    return p.sub('', data)
    
def getUpdatedMessage(note, accessURL, manifestStr, pin):

    html = ""
    text = ""

    APP_PATH = ""
    FILE = open(APP_PATH + 'data/apps.json', 'r')
    APPS_JSON = FILE.read()
    FILE.close()
    
    apps = json.loads(APPS_JSON)
    manifest = json.loads(manifestStr)
    myapps = [x['id'] for x in manifest['apps']]

    for a in apps['apps']:
        if (a['id'] in myapps):
            name = a['name']
            icon = a['icon']
            id = a['id']
            html += "<p><a href='" + accessURL + "?initial_app=" + str(id) + "' target='_blank'><img border='0' src='" + icon + "' /></a> " + name + "</p>"
            text += name + " (" + accessURL + "?initial_app=" + str(id) + ")\n"
    
    FILE = open(APP_PATH + 'templates/message-apps.html', 'r')
    TEMPLATE_HTML = Template(FILE.read())
    FILE.close()
    FILE = open(APP_PATH + 'templates/message-apps.txt', 'r')
    TEMPLATE_TEXT = Template(FILE.read())
    FILE.close()
    
    html = TEMPLATE_HTML.substitute(note=note, pin=str(pin), apps=html)
    text = TEMPLATE_TEXT.substitute(note=remove_html_tags(note), pin=str(pin), apps=text)
    
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
                        if (part.get_filename().endswith(".xml")):
                            datafile = part.get_filename()
                            fp = open("temp/"+part.get_filename(), 'wb')
                            fp.write(part.get_payload(decode=True))
                            fp.close()
                        elif (part.get_filename().endswith(".json")):
                            manifest = part.get_payload(decode=True)
                    elif c_type == 'text/plain' and c_disp == None:
                        mytext = part.get_payload(decode=True)
                    elif c_type == 'text/html' and c_disp == None:
                        myhtml = part.get_payload(decode=True)
                    else:
                        continue
                
                os.system("./import-patient " + APP_PATH + "temp/" + datafile)
                
                subject = mail["Subject"].replace("[SMART_APP]", "")
                patientID = datafile.replace("p","").replace(".xml","")
                pin = generatePIN()
                url = getAccessURL (patientID, pin)
                sender,recipient = getSenderRecipient(manifest)
                mytext,myhtml = getUpdatedMessage(mytext, url, manifest, pin)
                
                sender = SMTP_USER + "@" + SMTP_HOST
                attachments = []
                settings = {'host': SMTP_HOST, 'user': SMTP_USER, 'password': SMTP_PASS}
                sendEmail (sender, recipient, subject, mytext, myhtml, attachments, settings)
                M.dele(i+1)
                
            else:
                print "Message is NOT multipart... skipping"
                
        else:
            print "Message format not recognized... skipping"
        
        print "=" * 40        
    M.quit()
    
if __name__ == "__main__":
    print "Running mail poller"
    print "=" * 40
    while 1:
      time.sleep (2)
      checkMail ()