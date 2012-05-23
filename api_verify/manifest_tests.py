'''Module providing manifest tests for the SMART API Verifier'''
# Developed by: Nikolai Schwertner
#
# Revision history:
#     2012-05-14 Initial release

# Standard module imports
import string
import re

def isurl (str):
    if isinstance(str, basestring) and (str.startswith("http://") or str.startswith("https://")):
        return True
    else:
        return False

def manifest_structure_validator (manifest):
    '''A structure test for a manifest's JSON'''
    
    messages = []
    
    if type(manifest) != dict:
    
        messages.append ("The manifest definition should be a dictionary")
        
    else:
    
        keys = manifest.keys()
        
        if "name" not in keys or not isinstance(manifest["name"], basestring) :
            messages.append ("All app manifests must have a 'name' string property")
            
        if "description" not in keys or not isinstance(manifest["description"], basestring) :
            messages.append ("All app manifests must have a 'description' string property")
            
        if "id" not in keys or not isinstance(manifest["id"], basestring) :
            messages.append ("All app manifests must have a 'id' string property")
            
        if "mode" not in keys or manifest["mode"] not in ("ui","background","frame_ui") :
            messages.append ("'mode' property must be one of ('ui','background','frame_ui')")
        elif manifest["mode"] in ("ui","frame_ui"):
            if "icon" not in keys or not isurl(manifest["icon"]):
                messages.append ("'icon' propery for non-background apps should be an http/https URL")
            if "index" not in keys or not isurl(manifest["index"]):
                messages.append ("'index' propery for non-background apps should be an http/https URL")
        elif manifest["mode"] == "background":
            if "icon" in keys or "index" in keys or "optimalBrowserEnvironments" in keys or "supportedBrowserEnvironments" in keys:
                messages.append ("Background apps should not have 'icon', 'index', 'supportedBrowserEnvironments', or 'optimalBrowserEnvironments' properties in their manifest")

        if "scope" in keys and not isinstance(manifest["scope"], basestring) :
            messages.append ("'scope' parameter should be a string property")
            
        if "version" in keys and not isinstance(manifest["version"], basestring) :
            messages.append ("'version' parameter should be a string property")
            
        if "author" in keys and not isinstance(manifest["author"], basestring) :
            messages.append ("'author' should be a string property")
            
        if "smart_version" in keys and not re.match("^[\d]+(?:\.[\d]+){0,2}$", manifest["smart_version"]) :
            messages.append ("'smart_version' should be of type 'major[.minor][.build]'")
            
        if "optimalBrowserEnvironments" in keys: 
            if type(manifest["optimalBrowserEnvironments"]) != list :
                messages.append ("'optimalBrowserEnvironments' property should define a list")
            else:
                for e in manifest["optimalBrowserEnvironments"]:
                    if e not in ("desktop", "mobile", "tablet"):
                        messages.append ("'optimalBrowserEnvironments' list items must be one of ('desktop', 'mobile', 'tablet')")
                     
        if "supportedBrowserEnvironments" in keys: 
            if type(manifest["supportedBrowserEnvironments"]) != list :
                messages.append ("'supportedBrowserEnvironments' property should define a list")
            else:
                for e in manifest["supportedBrowserEnvironments"]:
                    if e not in ("desktop", "mobile", "tablet"):
                        messages.append ("'supportedBrowserEnvironments' list items must be one of ('desktop', 'mobile', 'tablet')")
            
        if "requires" in keys:
            r = manifest["requires"]
            if type(r) != dict:
                messages.append ("The 'requires' property definition should be a dictionary")
            else:
                for api in r.keys():
                    if not isurl(api):
                        messages.append ("The '%s' property should be a valid http/https url" % api)
                    if type(r[api]) != dict:
                        messages.append ("The '%s' property definition should be a dictionary" % api)
                    else:
                        if "methods" not in r[api].keys() or type(r[api]["methods"]) != list :
                            messages.append ("'%s' property should define a 'methods' list" % api)
                        else:
                            for m in r[api]["methods"]:
                                if m not in ("GET", "PUT", "POST", "DELETE"):
                                    messages.append ("'methods' list items must be one of ('GET', 'PUT', 'POST', 'DELETE')")
                        if "codes" in r[api].keys() :
                            if type(r[api]["codes"]) != list :
                                messages.append ("'codes' property should be a list")
                            else:
                                for c in r[api]["codes"]:
                                    if not isurl(c):
                                        messages.append ("'%s' should be an http/https URL" % c)
                        for k in (key for key in r[api].keys() if key not in ("methods", "codes")):
                            messages.append ("'%s' property is not part of the SMART standard" % k)
            
        for k in (key for key in keys if key not in ("name", "description", "author", "id", "version", "mode", "scope", "icon", "index", "smart_version", "requires", "optimalBrowserEnvironments", "supportedBrowserEnvironments")):
            messages.append ("'%s' property is not part of the SMART standard" % k)
        
    return messages