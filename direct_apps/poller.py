'''SMART Direct Apps message processing service'''
# Developed by: Nikolai Schwertner
#
# Revision history:
#     2011-10-04 Initial release

# Import some general modules
import poplib
import time
import string
import email
import os
import random
import json
import re
import web

# Import additional components
from email.parser import FeedParser
from StringIO import StringIO
from sendmail import send_message
from utilities import get_app_manifests

# Import the local library modules classes and methods
from lib.html2text import html2text

# Import the SMART client
from smart_client.smart import SmartClient

# Import the application settings
from settings import APP_PATH, SMTP_HOST, SMTP_USER, SMTP_PASS
from settings import SMTP_HOST_ALT, SMTP_USER_ALT, SMTP_PASS_ALT 
from settings import PROXY_OAUTH, PROXY_PARAMS, BACKGROUND_OAUTH, BACKGROUND_PARAMS
from settings import SMART_DIRECT_PREFIX

def generate_pin ():
    '''Returns a random PIN number in the range [1000-9999]'''
    pin = str(random.randint(1000, 9999))
    return pin

def generate_pid ():
    '''Returns a unique patient ID number in the range [100000000-999999999]'''
    
    # Keep generating random PIDs until a unique one is found
    while True:
    
        # Generate a new PID
        pid = str(random.randint(100000000, 999999999))
        isUnique = True
        
        print "Generated PID:", pid

        # Initialize a background app SMART client
        smart_client = SmartClient(PROXY_OAUTH['consumer_key'], PROXY_PARAMS, PROXY_OAUTH, None)

        # Check if the PID already exists
        try:
            target = '/apps/' + BACKGROUND_OAUTH['consumer_key'] + '/tokens/records/' + pid
            smart_client.get(target)
            isUnique = False
        except:
            pass

        # Kill the loop when the PID is determined to be unique        
        if isUnique:
            break

    # Return the fresh PID
    print "PID is unique"
    return pid
    
def get_access_url (patientID, pin):
    '''Generates a secure SMART Proxy access URL to the patient record'''
    
    # Intialize a machine app SMART client
    smart_client = SmartClient(PROXY_OAUTH['consumer_key'], PROXY_PARAMS, PROXY_OAUTH, None)
    
    # Request and return the deep web URL
    res = smart_client.get("/records/" + patientID + "/generate_direct_url", {'pin':pin}).body
    return res
    
def get_sender_recipient(manifestStr):
    '''Parses the provided SMART Direct manifest and
    returns the sender and recipient direct addresses
    '''
    
    manifest = json.loads(manifestStr)
    return [manifest['from'],manifest['to']]
    
def remove_html_tags(html):
    '''Converts an html snippet to marked-down text and returns it'''
    
    # Convert the HTML to plain text using the html2text module 
    out = html2text (html)
    
    # Strip out the leading the trailing white space
    out = string.lstrip(string.rstrip (out))

    return out
    
def get_updated_messages(note, accessURL, manifestStr, pin):
    '''Generates and returns the final html and plain-text e-mail body texts
    to be sent to the SMART Direct recipient
    '''
    
    html = ""
    text = ""

    # Parse the apps list and build a new list containing only
    # the manifest details of the apps needed for this message
    apps = json.loads(get_app_manifests())
    manifest = json.loads(manifestStr)
    myapps = [x['id'] for x in manifest['apps']]
    apps_out = [a for a in apps if a['id'] in myapps]

    # Build the final messages from the templates
    template_html = web.template.frender(APP_PATH + '/templates/message-apps.html')
    template_text = web.template.frender(APP_PATH + '/templates/message-apps.txt')
    html = template_html(note, str(pin), accessURL, apps_out)
    text = template_text(remove_html_tags(note), str(pin), accessURL, apps_out)
    
    # Return the final messages as strings
    return [str(text),str(html)]

def check_mail ():
    '''Processes all the new messages in the SMART Direct mailbox'''
    
    # Log into the mailbox
    M = poplib.POP3_SSL(SMTP_HOST)
    M.user(SMTP_USER)
    M.pass_(SMTP_PASS)
    
    # Obtain the count of the new messages
    numMessages = len(M.list()[1])
    
    # Iterate over the new messages
    for i in range(numMessages):
    
        # Load the message into an e-mail object
        msg = M.retr(i+1)
        str = string.join(msg[1], "\n")
        mail = email.message_from_string(str)

        # Print some useful information
        print "From:", mail["From"]
        print "Subject:", mail["Subject"]
        print "Date:", mail["Date"]

        # Delete any Direct auto-response message
        if mail["Subject"].lower().startswith("processed:"):
        
            M.dele(i+1)
            print "Auto-response confirmation message... deleted"
        
        # Process any SMART Direct Apps message
        elif mail["Subject"].startswith(SMART_DIRECT_PREFIX):
        
            # The message is expected to be multipart
            assert mail.is_multipart(), "Non-multipart SMART Direct message detected"
            
            # Process the various message parts
            for part in mail.walk():
            
                # Get the content type and disposition of the part
                c_type = part.get_content_type()
                c_disp = part.get('Content-Disposition')

                # Process an attachment part
                if c_disp != None:
                
                    print "attachment: ", part.get_filename()
                    
                    # Process a patient RDF payload
                    if part.get_filename() == "patient.xml":
                    
                        # Generate a new PID and write the attachment in a new
                        # file named "p123456.xml" where 123456 is the new PID
                        #   (consider using the python tempfile library here
                        #    once the import script requirement to have the patientID
                        #    in the filename is relaxed)
                        patientID = generate_pid()
                        datafile = "p" + patientID + ".xml"
                        patientRDF_str = part.get_payload(decode=True)
                        fp = open(APP_PATH + "/temp/" + datafile, 'wb')
                        fp.write(patientRDF_str)
                        fp.close()
                    
                    # Manifest data should be loaded into a string
                    elif part.get_filename() == "manifest.json":
                        manifest = part.get_payload(decode=True)
                
                # Load any inline HTML or plain-text part into local variables
                elif c_type == 'text/plain' and c_disp == None:
                    mytext = part.get_payload(decode=True)
                elif c_type == 'text/html' and c_disp == None:
                    myhtml = part.get_payload(decode=True)
                
                # Skip everything else
                else:
                    continue
            
            # Would be nice to improve the import script so that it could take
            # an arbitrary file and get the patientID as a separate parameter.
            # Then we won't need to encode the patientID in the filename.
            os.system(APP_PATH + "/import-patient " + APP_PATH + "/temp/" + datafile)
            
            
            pin = generate_pin()
            url = get_access_url (patientID, pin)
            sender,recipient = get_sender_recipient(manifest)
            mytext,myhtml = get_updated_messages(myhtml, url, manifest, pin)
            
            # Generate the subject of the final message from the original subject
            # by stripping out the prefix
            subject = mail["Subject"].replace(SMART_DIRECT_PREFIX, "")
            
            # Set the sender address to the primary Direct account
            sender = SMTP_USER + "@" + SMTP_HOST
            
            # Initialize a string buffer object with the patient RDF
            rdfbuffer = StringIO()
            rdfbuffer.write(patientRDF_str)
            
            # Set up the attachments and general settings for the mailer
            attachments = [{'file_buffer': rdfbuffer, 'name': 'patient.xml', 'mime': "text/xml"}]
            settings = {'host': SMTP_HOST, 'user': SMTP_USER, 'password': SMTP_PASS}
            
            # Send out the final direct message
            send_message (sender, recipient, subject, mytext, myhtml, attachments, settings)
            
            # Delete the processed direct message
            M.dele(i+1)
            
            # Clean up the string buffer
            rdfbuffer.close()
            
            print "Direct message sent to", recipient
                
        else:
            # We've got a boogie here!
            print "Message format not recognized... skipping"
        
        print "=" * 40

    # Log out from the mail server
    M.quit()
   
# Intilaize the pseudo-random number generator
random.seed()
   
if __name__ == "__main__":

    print "Running mail poller"
    print "=" * 40
    
    # Check for new messages every 2 seconds forever
    while True:
        time.sleep (2)
        try:
            check_mail ()
        except Exception, e:
            print "Unable to process mail"