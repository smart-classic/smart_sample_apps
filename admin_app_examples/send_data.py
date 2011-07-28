"""
Example SMArt REST Application: 

 * Required "admin" app privileges on smart container
 * Pushes data into the container using "Stage 1 Write API"

Josh Mandel
Children's Hospital Boston, 2011
"""

from pipeline_base import *

def submit_data(args):
    client = get_smart_client()
    data = args.datafile.read() 
    method = getattr(client, args.method.lower())
    response = method(args.path, data)

    print response

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test Data Writer', epilog="""Example usage:  PYTHONPATH=../.. python send_data.py --method POST --path /records/123/medication --data /path/to/medication.xml
""")

    parser.add_argument('--path',dest='path', nargs='?', required=True,
                        help="specify path to post to, relative to container base (e.g. '/records/1234/medications/')")

    parser.add_argument('--method',dest='method', nargs='?', default='POST',choices=['POST','PUT'],
                        help="specify HTTP method, defaults to POST")

    parser.add_argument('--data', dest='datafile', nargs='?', default=sys.stdout, type=argparse.FileType('r'),
                        help="specify data to transmit, defaults to stdin")

    args = parser.parse_args()

    submit_data(args)
    

