"""
Generate all API methods from SMArt_ontology.owl
"""

import os, re, settings
import surf
import rdflib
from StringIO import StringIO

pFormat = "{.*?}"
SMART  = "http://smartplatforms.org/"

sp = rdflib.Namespace("http://smartplatforms.org/terms#")
api = rdflib.Namespace("http://smartplatforms.org/api/")
rdf = rdflib.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")

class CallAttr(object):
    def __init__(self, name, predicate, uri_p=False, list_p=False):
        self.name = name
        self.predicate = predicate
        self.uri_p = uri_p
        self.list_p = list_p
        
    def extract(self, data):
        return str(data)

class CallInfo(object):
  attrs =  [CallAttr("target", api['target'], True),
            CallAttr("above", api['above']),
            CallAttr("description", api['description']),
            CallAttr("path", api['path']),
            CallAttr("method", api['method']),
            CallAttr("by_internal_id", api['by_internal_id']),
            CallAttr("category", api['category'])]
  
  def __init__(self, g, c):
    for a in self.__class__.attrs:
        try: 
            v = [a.extract(x) for x in g.objects(c, a.predicate)]
            if not a.list_p: v = v[0]
            setattr(self, a.name, v) 
        except: setattr(self, a.name, None)
    return

  @classmethod
  def find_all_calls(cls, g):
    calls = []
    for c in g.subjects(rdf["type"], api["call"]):
      i = CallInfo(g, c)
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
          ret =  f(url=url, data=data, content_type=content_type)
          return self.data_mapper(ret)
      return c

def augment(client_class):
    g = rdflib.ConjunctiveGraph()
    g.parse(StringIO(client_class.ontology))
    all_calls = CallInfo.find_all_calls(g)
    for c in all_calls:
        print "and a call", c.call_name
        setattr(client_class, c.call_name, c.make_generic_call())

    for prefix, uri in g.namespaces():
        surf.ns.register(**{prefix: uri})
