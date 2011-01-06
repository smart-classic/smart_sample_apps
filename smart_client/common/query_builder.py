import re

class QueryBuilder(object):
    def __init__(self, root_type, root_name):
        self.root_type = root_type
        self.triples_created = []
        self.identifier_count = {}
        
        self.root_name = self.get_identifier(root_name)

    def construct_triples(self):
        return "\n ".join(self.triples_created)
        
    def require_above(self, above_type=None, above_uri=None):
        if (above_uri == None): return
        predicate = above_type.predicate_for_contained_type(self.root_type)
        predicate = str(predicate.uri)
        self.required_triple("<"+above_uri+">", "<"+predicate+">", self.root_name )
        
    def get_identifier(self, id_base, role="predicate"):
        if id_base[0] == "<" or id_base.startswith("_:"): return id_base
        
        start = id_base[0] == "?" and "?" or ""

        if "/" in id_base:
          id_base = id_base.rsplit("/", 1)[1]
        if "#" in id_base:
          id_base = id_base.rsplit("#", 1)[1]

        id_base = re.sub(r'\W+', '', id_base)
        id_base = start + id_base + "_" + role

        self.identifier_count.setdefault(id_base, 0)
        self.identifier_count[id_base] += 1
        return "%s_%s"%(id_base, self.identifier_count[id_base])

    def required_triple(self, root_name, pred, obj):
        self.triples_created.append("%s %s %s. " % (root_name, pred, obj))
        return " %s %s %s. \n" % (root_name, pred, obj)

    def optional_triple(self, root_name, pred, obj):
        self.triples_created.append("%s %s %s. " % (root_name, pred, obj))
        return " OPTIONAL { %s %s %s. } \n" % (root_name, pred, obj)
        
    def optional_linked_type(self, linked_type, root_name,  predicate, object, to_follow, depth):
        self.triples_created.append("%s %s %s. " % (root_name, predicate, object))
        ret = " OPTIONAL { %s %s %s. $insertion } \n" % (root_name, predicate, object)
        repl = self.build(to_follow, linked_type, depth)
        ret = ret.replace("$insertion", repl)
        return ret

    def build(self, root_name=None, root_type=None, depth=0):
        ret = ""
        # Recursion starting off:  set initial conditions (if any).
        if root_type == None:
            root_name = self.root_name
            root_type = self.root_type            
            ret = " ".join(self.triples_created)
            
        if (root_type.base_path != None):
            ret += self.required_triple(root_name, "rdf:type", "<"+str(root_type.node.uri)+">")
        else:
            ret += self.optional_triple(root_name, "rdf:type", "<"+str(root_type.node.uri)+">")

        for p in root_type.properties:
            p = str(p.property.uri)
            oid = self.get_identifier("?"+p, "object")
            ret  += self.optional_triple(root_name, "<"+p+">", oid)

        # We'll traverse + recurse down *only* from the top of the hierarchy
        # OR if we're dealing with "core" (i.e. blank-node, i.e. non-GETtable) resources.
        for pred, contained in root_type.contained_types.iteritems():
            if depth > 0 and contained.base_path: continue

            p = str(pred.uri)
            oid = self.get_identifier("?"+p, "object")
            ret += self.optional_linked_type(linked_type=contained, 
                                             root_name=root_name,
                                             predicate="<"+p+">", 
                                             object=oid, 
                                             to_follow=oid,
                                             depth=depth+1)

        # We'll only traverse *up* once, from the top level of our query. 
        if depth == 0:
            for containing, pred in root_type.containing_types.iteritems():
                p = str(pred.uri)
                oid = self.get_identifier("?"+p, "object")
                ret += self.optional_linked_type(linked_type=containing, 
                                                 root_name=oid, 
                                                 predicate="<"+p+">", 
                                                 object=root_name, 
                                                 to_follow=oid,
                                                 depth=depth+1)
        
        return ret
