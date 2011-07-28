import time
import random


from pipeline_base import *

def gen_data():
    t = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(time.time() - random.randint(3000000,30000000)))
    s = random.randint(70,130)
    d = s * (.2 + random.random() * .6)
    
    b = open("example_rdf/vs_template.xml").read()
    b = b.replace("{{DATE}}", t)
    b = b.replace("{{SBP}}", str(int(s)))
    b = b.replace("{{DBP}}", str(int(d)))
    return b

def submit_data(args):
    client = get_smart_client()
    data = gen_data() 
    response = client.post(args.path, data)
    print response

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test Data Writer')

    parser.add_argument('--path',dest='path', nargs='?', required=True,
                        help="specify path to post to, relative to container base (e.g. '/records/1081332/vital_signs/')")

    args = parser.parse_args()

    submit_data(args)
    

