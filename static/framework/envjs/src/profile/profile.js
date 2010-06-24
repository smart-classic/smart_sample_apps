

var $profile = window.$profile = {};

//Make these global to avoid namespace pollution in tests.
/*var __profile__ = function(id, invocation){*/
__profile__ = function(id, invocation){
    var start = new Date().getTime();
    var retval = invocation.proceed(); 
    var finish = new Date().getTime();
    $profile[id] = $profile[id] ? $profile[id] : {};
    $profile[id].callCount = $profile[id].callCount !== undefined ? 
        $profile[id].callCount+1 : 0;
    $profile[id].times = $profile[id].times ? $profile[id].times : [];
    $profile[id].times[$profile[id].callCount++] = (finish-start);
    return retval;
};


window.$profiler.stats = function(raw){
    var max     = 0,
        avg     = -1,
        min     = 10000000,
        own     = 0;
    for(var i = 0;i<raw.length;i++){
        if(raw[i] > 0){
            own += raw[i];
        };
        if(raw[i] > max){
            max = raw[i];
        }
        if(raw[i] < min){
            min = raw[i];
        }
    }
    avg = Math.floor(own/raw.length);
    return {
        min: min,
        max: max,
        avg: avg,
        own: own
    };
};

if($env.profile){
    /**
    *   CSS2Properties
    */
    window.$profiler.around({ target: CSS2Properties,  method:"getPropertyCSSValue"}, function(invocation) {
        return __profile__("CSS2Properties.getPropertyCSSValue", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"getPropertyPriority"}, function(invocation) {
        return __profile__("CSS2Properties.getPropertyPriority", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"getPropertyValue"}, function(invocation) {
        return __profile__("CSS2Properties.getPropertyValue", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"item"}, function(invocation) {
        return __profile__("CSS2Properties.item", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"removeProperty"}, function(invocation) {
        return __profile__("CSS2Properties.removeProperty", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"setProperty"}, function(invocation) {
        return __profile__("CSS2Properties.setProperty", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"toString"}, function(invocation) {
        return __profile__("CSS2Properties.toString", invocation);
    });  
               
    
    /**
    *   Node
    */
                    
    window.$profiler.around({ target: Node,  method:"hasAttributes"}, function(invocation) {
        return __profile__("Node.hasAttributes", invocation);
    });          
    window.$profiler.around({ target: Node,  method:"insertBefore"}, function(invocation) {
        return __profile__("Node.insertBefore", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"replaceChild"}, function(invocation) {
        return __profile__("Node.replaceChild", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"removeChild"}, function(invocation) {
        return __profile__("Node.removeChild", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"replaceChild"}, function(invocation) {
        return __profile__("Node.replaceChild", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"appendChild"}, function(invocation) {
        return __profile__("Node.appendChild", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"hasChildNodes"}, function(invocation) {
        return __profile__("Node.hasChildNodes", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"cloneNode"}, function(invocation) {
        return __profile__("Node.cloneNode", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"normalize"}, function(invocation) {
        return __profile__("Node.normalize", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"isSupported"}, function(invocation) {
        return __profile__("Node.isSupported", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"getElementsByTagName"}, function(invocation) {
        return __profile__("Node.getElementsByTagName", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"getElementsByTagNameNS"}, function(invocation) {
        return __profile__("Node.getElementsByTagNameNS", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"importNode"}, function(invocation) {
        return __profile__("Node.importNode", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"contains"}, function(invocation) {
        return __profile__("Node.contains", invocation);
    }); 
    window.$profiler.around({ target: Node,  method:"compareDocumentPosition"}, function(invocation) {
        return __profile__("Node.compareDocumentPosition", invocation);
    }); 
    
    
    /**
    *   Document
    */
    window.$profiler.around({ target: Document,  method:"addEventListener"}, function(invocation) {
        return __profile__("Document.addEventListener", invocation);
    });
    window.$profiler.around({ target: Document,  method:"removeEventListener"}, function(invocation) {
        return __profile__("Document.removeEventListener", invocation);
    });
    window.$profiler.around({ target: Document,  method:"attachEvent"}, function(invocation) {
        return __profile__("Document.attachEvent", invocation);
    });
    window.$profiler.around({ target: Document,  method:"detachEvent"}, function(invocation) {
        return __profile__("Document.detachEvent", invocation);
    });
    window.$profiler.around({ target: Document,  method:"dispatchEvent"}, function(invocation) {
        return __profile__("Document.dispatchEvent", invocation);
    });
    window.$profiler.around({ target: Document,  method:"loadXML"}, function(invocation) {
        return __profile__("Document.loadXML", invocation);
    });
    window.$profiler.around({ target: Document,  method:"load"}, function(invocation) {
        return __profile__("Document.load", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createEvent"}, function(invocation) {
        return __profile__("Document.createEvent", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createExpression"}, function(invocation) {
        return __profile__("Document.createExpression", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createElement"}, function(invocation) {
        return __profile__("Document.createElement", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createDocumentFragment"}, function(invocation) {
        return __profile__("Document.createDocumentFragment", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createTextNode"}, function(invocation) {
        return __profile__("Document.createTextNode", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createComment"}, function(invocation) {
        return __profile__("Document.createComment", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createCDATASection"}, function(invocation) {
        return __profile__("Document.createCDATASection", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createProcessingInstruction"}, function(invocation) {
        return __profile__("Document.createProcessingInstruction", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createAttribute"}, function(invocation) {
        return __profile__("Document.createAttribute", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createElementNS"}, function(invocation) {
        return __profile__("Document.createElementNS", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createAttributeNS"}, function(invocation) {
        return __profile__("Document.createAttributeNS", invocation);
    });
    window.$profiler.around({ target: Document,  method:"createNamespace"}, function(invocation) {
        return __profile__("Document.createNamespace", invocation);
    });
    window.$profiler.around({ target: Document,  method:"getElementById"}, function(invocation) {
        return __profile__("Document.getElementById", invocation);
    });
    window.$profiler.around({ target: Document,  method:"normalizeDocument"}, function(invocation) {
        return __profile__("Document.normalizeDocument", invocation);
    });
    
    
    /**
    *   HTMLDocument
    */      
    window.$profiler.around({ target: HTMLDocument,  method:"createElement"}, function(invocation) {
        return __profile__("HTMLDocument.createElement", invocation);
    }); 
    
    /**
    *   Parser
    */      
    window.$profiler.around({ target: Parser,  method:"parseFromString"}, function(invocation) {
        return __profile__("Parser.parseFromString", invocation);
    }); 
    
    /**
    *   NodeList
    */      
    window.$profiler.around({ target: NodeList,  method:"item"}, function(invocation) {
        return __profile__("Node.item", invocation);
    }); 
    window.$profiler.around({ target: NodeList,  method:"toString"}, function(invocation) {
        return __profile__("Node.toString", invocation);
    }); 
    
    
}
      
