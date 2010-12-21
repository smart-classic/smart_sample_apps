"""
Generate all API methods from SMArt_ontology.owl
"""

import os, RDF, re, settings
from rdf_utils import NS  

pFormat = "{.*?}"
rdf = NS['rdf']
sp = NS['sp']
SMART  = "http://smartplatforms.org/"

class CallAttr(object):
    def __init__(self, name, predicate, uri_p=False, list_p=False):
        self.name = name
        self.predicate = predicate
        self.uri_p = uri_p
        self.list_p = list_p
        
    def extract(self, data):
        if (self.uri_p):
            return str(data.object.uri)
        else:
            return str(data.object.literal_value['string'])

class CallInfo(object):
  attrs =  [CallAttr("target", sp['api/target'], True),
            CallAttr("description", sp['api/description']),
            CallAttr("path", sp['api/path']),
            CallAttr("method", sp['api/method']),
            CallAttr("by_internal_id", sp['api/by_internal_id']),
            CallAttr("category", sp['api/category'])]
  
  def __init__(self, m, c):
    self.model = m
    for a in self.__class__.attrs:
        try: 
            v = [a.extract(x) for x in m.find_statements(RDF.Statement(c, a.predicate, None))][0]
            setattr(self, a.name, v) 
        except: setattr(self, a.name, None)
    return

  @classmethod
  def find_all_calls(cls, m):
    def get_api_calls(m):
      q = RDF.Statement(None, rdf['type'], sp['api/call'])
      r = list(m.find_statements(q))
      return r

    calls = []
    for c in get_api_calls(m):
      i = CallInfo(m, c.subject)
      calls.append(i)
    return calls

  def parameter_optional(self, p):
      mark = self.path.find("?")
      point = self.path.find(p)
      return -1 < mark < point

  def fill_url_template(self, *args, **kwargs):
      url = "/" + self.path.replace(SMART, "")
      url = url.split("?")[0]

      # Look for each param in kwargs.  
      for p in self.params:
          try:  
              v = kwargs[p]
              url = url.replace("{%s}"%p, v)
          except KeyError as e:
              # If not found:
              #    1.  Try to find it as a direct attribute of the SmartClient
              try: v = getattr(kwargs['_client'], p)
              except: 
                  #    2.  See if it's optional (and thus can be skipped)
                  if self.parameter_optional(p):
                      v = ""
                  else: raise e
          url = url.replace("{%s}"%p, v)
      return url

  @property
  def call_name(self):
      ret = self.path.replace(SMART, "")
      ret = ret.split("?")[0]
      ret = ret.replace("/", "_")
      ret = re.sub(pFormat, "_X", ret)
      ret = ret + "_" + self.method
      ret = re.sub("_+", "_", ret)
      return ret

  @property
  def params(self):
      return [x[1:-1] for x in re.findall(pFormat, self.path)]
  
  def make_generic_call(self):
      call = self
      def c(self, *args, **kwargs):
          kwargs['_client'] = self
          url = call.fill_url_template(**kwargs)
          data = kwargs.get('data', None) 
          content_type = kwargs.get('content_type', None)
          f = getattr(self, call.method.lower())          
          return f(url=url, data=data, content_type=content_type)          
      return c

def augment(client_class):
    m = RDF.Model()
    p = RDF.Parser()
    p.parse_string_into_model(m, client_class.ontology, "nodefault")
    all_calls = CallInfo.find_all_calls(m)
    for c in all_calls:
        setattr(client_class, c.call_name, c.make_generic_call())