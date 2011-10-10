from StringIO import StringIO

from settings import APP_PATH

# Import the PDF modules
from reportlab.lib.units import cm, mm
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer

def generatePDF (text):
    buff = StringIO()
    pdf = SimpleDocTemplate(buff, pagesize = A4)
    story = []
    style = getSampleStyleSheet()
    
    story.append(Image(APP_PATH+"static/images/smart-logo.png"))
    story.append(Spacer(0, cm * 1))
    
    paragraphs = text.split("\n")
    for para in paragraphs:
        if len(para) == 0:
            story.append(Spacer(0, cm * .3))
        if para.startswith("<li>"):
            story.append(Paragraph("&nbsp;&nbsp;&nbsp;&#149; " + para, style["Normal"]))
        else:
            story.append(Paragraph(para, style["Normal"]))
        
    pdf.build(story)
    return buff