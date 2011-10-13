'''Module providing e-mail generating functionaly for the SMART Direct Apps'''
# Developed by: Nikolai Schwertner
#
# Revision history:
#     2011-10-04 Initial release

# Import smtplib for the actual sending function
import smtplib

# Import various email module components
from email import encoders
from email.header import Header
from email.utils import formataddr
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart

def send_message (from_, to, subject, text, html, attachments, settings, from_name = 'SMART Direct'): 
    '''Generates and sends out a proper multipart email message
       with the supplied parameters over SMPTS (secure SMTP)
    '''

    # Record the MIME types of both parts - text/plain and text/html.
    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')

    # Generate a friendly "from" header
    from_header = Header (charset='us-ascii', header_name='from')
    formated_addr = formataddr ((from_name, from_))
    from_header.append (formated_addr, charset='us-ascii')
    
    # Create the enclosing (outer) message
    outer = MIMEMultipart('mixed')
    outer['To'] = to
    outer['From'] = from_header
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
    
    # Process the attachments and add them to the message
    for a in attachments:
        ctype = a['mime']
        maintype, subtype = ctype.split('/', 1)
        msg = MIMEBase(maintype, subtype)
        msg.set_payload(a['file_buffer'].getvalue())
        encoders.encode_base64(msg)
        msg.add_header('Content-Disposition', 'attachment', filename=a['name'])
        outer.attach(msg)
    
    # Send the message via SMTPS
    user = settings['user']
    password = settings['password']
    s = smtplib.SMTP_SSL(settings['host'])
    s.login(user, password)
    s.sendmail(from_, [to], outer.as_string())
    s.close()