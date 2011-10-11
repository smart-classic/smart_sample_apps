'''Module for generating of SMART Direct PDF attachments'''
# Developed by: Nikolai Schwertner
#
# Revision history:
#     2011-10-04 Initial release

from StringIO import StringIO
from settings import APP_PATH

# Import the PDF module components
from reportlab.lib.units import cm, mm
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer

def generatePDF (html):
    '''Returns a StringIO object containing the PDF code
    generated from the html text povided'''
    
    # Initialize the local objects
    buff = StringIO()
    pdf = SimpleDocTemplate(buff, pagesize = A4)
    story = []
    style = getSampleStyleSheet()
    
    # Add the SMART logo to the story
    story.append(Image(APP_PATH+"static/images/smart-logo.png"))
    story.append(Spacer(0, cm * 1))
    
    # Break the text into paragraps and process each paragraph
    paragraphs = html.split("\n")
    for para in paragraphs:
    
        # Insert a spacer for empty paragraphs
        if len(para) == 0:
            story.append(Spacer(0, cm * .3))
            
        # Add any normal paragraph to the story with the Normal style
        if para.startswith("<li>"):
            # for "<li>" items add a bullet
            story.append(Paragraph("&nbsp;&nbsp;&nbsp;&#149; " + para, style["Normal"]))
        else:
            story.append(Paragraph(para, style["Normal"]))
    
    # Build the PDF and return the string buffer object
    pdf.build(story)
    return buff