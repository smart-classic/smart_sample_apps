import random

f = """male,2,0.88,90,42
male,2.5,0.92,92,48
male,2.6666666666666665,0.96,94,45
male,3.1666666666666665,0.99,98,52
male,4,1.06,102,56
male,4.5,1.1,104,62
male,5,1.12,106,64
male,5.25,1.14,105,65
male,5.25,1.14,107,67
male,5.5,1.16,113,71
male,5.75,1.18,113,72
male,5.916666666666667,1.19,112,73
male,6.25,1.22,112,71
male,6.5,1.23,110,69
male,6.75,1.24,106,65
male,7,1.24,104,63
male,7.25,1.28,106,65
male,7.5,1.29,106,68
male,7.75,1.31,106,63
male,7,1.32,108,69"""

ll = f.split("\n");
stats = [[float(x) for x in l.split(',')[1:]] for l in ll]

start = stats[0][1]
finish = stats[-1][1]

def interpolate(t):
  for i in range(1, len(stats)):
    if stats[i-1][0] <= t and stats[i][0] > t:
      return ((t-stats[i-1][0])*1.0 / (stats[i][0]-stats[i-1][0]), stats[i-1], stats[i])

  assert false, "couldn't interpolate %s"%t

def fuzz(ratio, t1, t2):
  ret = []
  for i in range(len(t1)):
    v = (1.0-ratio) * t1[i] + 1.0*ratio* t2[i]
    if i >1:  # don't allow date or height to jitter randomly
      v += random.gauss(0, (t1[i] - t2[i])/3)
    ret.append(v)
  return ret


from string import Template

from datetime import datetime, timedelta
birthday = datetime.now() - timedelta(days=stats[-1][0]*365)
def add_years(d1, y):
  return d1 + timedelta(days=365*y)

encounter_types = {"ambulatory": "Ambulatory Encounter",
		"inpatient": "Inpatient Encounter"}

def choose_encounter_type():
	n = random.uniform(0, 1)
	if n < .25:
		return "inpatient"
	return "ambulatory"


limbs = {"368209003": "Right arm",
		"61396006": "Left thigh"}
def choose_limb():
	n = random.uniform(0, 1)
	if n < .2:
		return "368209003"
	return "61396006"

methods = { "Auscultation": "http://smartplatforms.org/terms/code/bloodPressureMethod#auscultation",
            "Machine": "http://smartplatforms.org/terms/code/bloodPressureMethod#machine"
}
def choose_method():
	n = random.uniform(0, 1)
	if n < .2:
		return "Auscultation"
	return "Machine"



header = """<?xml version="1.0" encoding="utf-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:sp="http://smartplatforms.org/terms#"
  xmlns:foaf="http://xmlns.com/foaf/0.1/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:v="http://www.w3.org/2006/vcard/ns#">


<sp:Demographics>
	<familyName xmlns="http://xmlns.com/foaf/0.1/">Misalis</familyName>
	<givenName xmlns="http://xmlns.com/foaf/0.1/">Aidan</givenName>
	<birthday xmlns="http://smartplatforms.org/terms#">%s</birthday>
	<gender xmlns="http://xmlns.com/foaf/0.1/">male</gender>
	<zipcode xmlns="http://smartplatforms.org/terms#">74063</zipcode>
</sp:Demographics>
"""%birthday.isoformat()

footer = """</rdf:RDF>"""


def tordf(v, include_height=False, include_bp=False):
  h = Template("""<sp:height>
      <sp:VitalSign>
       <sp:vitalName>
        <sp:CodedValue>
          <sp:code rdf:resource="http://loinc.org/codes/8302-2"/>
          <dcterms:title>Height (measured)</dcterms:title>
        </sp:CodedValue>
      </sp:vitalName>
      <sp:value>$height</sp:value>
      <sp:unit>m</sp:unit>
     </sp:VitalSign>
    </sp:height>
""")

  bp = Template("""    <sp:bloodPressure>
      <sp:BloodPressure>
       <sp:systolic>
         <sp:VitalSign>
          <sp:vitalName>
           <sp:CodedValue>
             <sp:code rdf:resource="http://loinc.org/codes/8480-6"/>
             <dcterms:title>Systolic blood pressure</dcterms:title>
           </sp:CodedValue>
         </sp:vitalName>
         <sp:value>$sbp</sp:value>
         <sp:unit>mm[Hg]</sp:unit>
        </sp:VitalSign>
       </sp:systolic>
       <sp:diastolic>
         <sp:VitalSign>
          <sp:vitalName>
           <sp:CodedValue>
             <sp:code rdf:resource="http://loinc.org/codes/8462-4"/>
             <dcterms:title>Diastolic blood pressure</dcterms:title>
           </sp:CodedValue>
         </sp:vitalName>
         <sp:value>$dbp</sp:value>
         <sp:unit>mm[Hg]</sp:unit>
        </sp:VitalSign>
       </sp:diastolic>
       <sp:bodyPosition>
         <sp:CodedValue>
           <sp:code rdf:resource="http://www.ihtsdo.org/snomed-ct/concepts/33586001"/>
           <dcterms:title>Sitting</dcterms:title>
         </sp:CodedValue>
       </sp:bodyPosition>
       <sp:bodySite>
         <sp:CodedValue>
           <sp:code rdf:resource="http://www.ihtsdo.org/snomed-ct/concepts/$limb"/>
           <dcterms:title>$limbn</dcterms:title>
         </sp:CodedValue>
       </sp:bodySite>
       <sp:method>
         <sp:CodedValue>
           <sp:code rdf:resource="$method"/>
           <dcterms:title>$methodn</dcterms:title>
         </sp:CodedValue>
       </sp:method>
      </sp:BloodPressure>
    </sp:bloodPressure>
""")

  r = Template("""
 <sp:VitalSigns>
    <dc:date>$vitals_date</dc:date>
    <sp:encounter>
	 <sp:Encounter>
	    <sp:startDate>$encounter_start_date</sp:startDate>
	    <sp:endDate>$encounter_end_date</sp:endDate>
	      <sp:encounterType>
		<sp:CodedValue>
		  <sp:code rdf:resource="http://smartplatforms.org/terms/code/encounterType#$encounter_type"/>
		  <dcterms:title>$encounter_type_name</dcterms:title>
		</sp:CodedValue>
	      </sp:encounterType>
	 </sp:Encounter>
    </sp:encounter>
$h
$bp
 </sp:VitalSigns>
""")

  et = choose_encounter_type()
  etn = encounter_types[et]

  limb = choose_limb()
  limbn = limbs[limb]

  methodn = choose_method()
  method = methods[methodn]


  if include_height:
    h = h.substitute(height=v[1])
  else: h = ""

  if include_bp:
    bp = bp.substitute(sbp=v[2], dbp=v[3],  limb=limb, limbn=limbn, method=method,methodn=methodn)
  else: bp=""


  return r.substitute(vitals_date=add_years(birthday, v[0]).isoformat(),
			encounter_start_date=add_years(birthday, v[0]).isoformat(),
			encounter_end_date=add_years(birthday, v[0]).isoformat(),
			encounter_type=et,
			encounter_type_name=etn,
			h=h, bp=bp)



a = []
for p in range(50):
  t = random.uniform(stats[0][0], stats[-1][0])
  r,t1,t2 = interpolate(t)
  v = fuzz(r,t1,t2)
  a.append(v)

print header
a.sort(key=lambda x: x[0])
for l in a:
  include_height=(random.random()<0.2)
  include_bp=not include_height
  print tordf(l, include_height, include_bp)
print footer

