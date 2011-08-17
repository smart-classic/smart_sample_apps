"""
Example SMArt REST Application: 

 * Required "admin" app privileges on smart container
 * Pushes data into the container using "Stage 1 Write API"

Josh Mandel
Children's Hospital Boston, 2011
"""

from pipeline_base import *

def run_query(args):


    client = get_smart_client()
    data = {}

    if args.gn:
        data["given_name"] = args.gn
    if args.fn:
        data["family_name"] = args.fn
    if args.zip
        data["zipcode"] = args.zip
    if args.gender:
        data["gender"] = args.gender
    if args.bday:
        data["birthday"] = args.bday
    if args.externalID:
        data["medical_record_number"] = args.externalID


        
    q = sparql.replace("$statements_here", ". \n".join(statements))
    print q


    response = client.get("/records/search", data=data)
    print response

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Query SMART Patients')

    parser.add_argument('--family-name',dest='fn', nargs='?', required=False,
                        help="Family name")

    parser.add_argument('--given-name',dest='gn', nargs='?', required=False,
                        help="Given name")

    parser.add_argument('--zip-code',dest='zip', nargs='?', required=False,
                        help="zip code")

    parser.add_argument('--birthday',dest='bday', nargs='?', required=False,
                        help="birthday as ISO-8601")

    parser.add_argument('--gender',dest='gender', nargs='?', required=False,
                        choices=['male','female'],
                        help="Gender")

    parser.add_argument('--external-medrec-system', dest='externalIDSystem', nargs='?', 
                        help="URI of the system scoping an external Medication Record Number for the patient")

    parser.add_argument('--external-medrec-number', dest='externalID', nargs='?', 
                        help="Literal value of the external Medication Record Number for the patient")

    args = parser.parse_args()

    run_query(args)
    

