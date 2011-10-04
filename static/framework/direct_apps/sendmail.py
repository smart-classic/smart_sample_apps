# Import smtplib for the actual sending function
import smtplib

# Import the email modules
from email import encoders
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart

from settings import APP_PATH

def sendEmail (from_, to, subject, text, html, attachments, settings): 

    # Record the MIME types of both parts - text/plain and text/html.
    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')

    # Create the enclosing (outer) message
    outer = MIMEMultipart('mixed')
    outer['To'] = to
    outer['From'] = from_
    outer['Subject'] = subject
    #outer.add_header('Reply-To', from_)
    outer.preamble = 'This is a multi-part message in MIME format.'

    # Attach parts into message container.
    # According to RFC 2046, the last part of a multipart message, in this case
    # the HTML message, is best and preferred.
    outer2 = MIMEMultipart('alternative')
    outer2.attach(part1)
    outer2.attach(part2)
    outer.attach(outer2)
    
    for a in attachments:
        file = APP_PATH + "temp/" + a['file']
        ctype = a['mime']
        maintype, subtype = ctype.split('/', 1)
        fp = open(file, 'rb')
        msg = MIMEBase(maintype, subtype)
        msg.set_payload(fp.read())
        fp.close()
        encoders.encode_base64(msg)
        msg.add_header('Content-Disposition', 'attachment', filename=a['name'])
        outer.attach(msg)
    
    user = settings['user']
    password = settings['password']
    s = smtplib.SMTP_SSL(settings['host'])
    s.login(user, password)
    s.sendmail(from_, [to], outer.as_string())
    s.close()
