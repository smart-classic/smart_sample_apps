
/**
 * @class  Element -
 *      By far the vast majority of objects (apart from text)
 *      that authors encounter when traversing a document are
 *      Element nodes.
 * @extends Node
 * @param  ownerDocument : The Document object associated with this node.
 */
Element = function(ownerDocument) {
    Node.apply(this, arguments);
    this.attributes = new NamedNodeMap(this.ownerDocument, this);
};
Element.prototype = new Node();
__extend__(Element.prototype, {
    // The name of the element.
    get tagName(){
        return this.nodeName;
    },

    getAttribute: function(name) {
        var ret = null;
        // if attribute exists, use it
        var attr = this.attributes.getNamedItem(name);
        if (attr) {
            ret = attr.value;
        }
        // if Attribute exists, return its value, otherwise, return null
        return ret;
    },
    setAttribute : function (name, value) {
        // if attribute exists, use it
        var attr = this.attributes.getNamedItem(name);
       //console.log('attr %s', attr);
        //I had to add this check because as the script initializes
        //the id may be set in the constructor, and the html element
        //overrides the id property with a getter/setter.
        if(__ownerDocument__(this)){
            if (attr===null||attr===undefined) {
                // otherwise create it
                attr = __ownerDocument__(this).createAttribute(name);
               //console.log('attr %s', attr);
            }


            // test for exceptions
            if (__ownerDocument__(this).implementation.errorChecking) {
                // throw Exception if Attribute is readonly
                if (attr._readonly) {
                    throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
                }

                // throw Exception if the value string contains an illegal character
                if (!__isValidString__(value+'')) {
                    throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
                }
            }

            // assign values to properties (and aliases)
            attr.value     = value + '';

            // add/replace Attribute in NamedNodeMap
            this.attributes.setNamedItem(attr);
           //console.log('element setNamedItem %s', attr);
        }else{
           console.warn('Element has no owner document '+this.tagName+
                '\n\t cant set attribute ' + name + ' = '+value );
        }
    },
    removeAttribute : function removeAttribute(name) {
        // delegate to NamedNodeMap.removeNamedItem
        return this.attributes.removeNamedItem(name);
    },
    getAttributeNode : function getAttributeNode(name) {
        // delegate to NamedNodeMap.getNamedItem
        return this.attributes.getNamedItem(name);
    },
    setAttributeNode: function(newAttr) {
        // if this Attribute is an ID
        if (__isIdDeclaration__(newAttr.name)) {
            this.id = newAttr.value;  // cache ID for getElementById()
        }
        // delegate to NamedNodeMap.setNamedItem
        return this.attributes.setNamedItem(newAttr);
    },
    removeAttributeNode: function(oldAttr) {
      // throw Exception if Attribute is readonly
      if (__ownerDocument__(this).implementation.errorChecking && oldAttr._readonly) {
        throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
      }

      // get item index
      var itemIndex = this.attributes._findItemIndex(oldAttr._id);

      // throw Exception if node does not exist in this map
      if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
        throw(new DOMException(DOMException.NOT_FOUND_ERR));
      }

      return this.attributes._removeChild(itemIndex);
    },
    getAttributeNS : function(namespaceURI, localName) {
        var ret = "";
        // delegate to NAmedNodeMap.getNamedItemNS
        var attr = this.attributes.getNamedItemNS(namespaceURI, localName);
        if (attr) {
            ret = attr.value;
        }
        return ret;  // if Attribute exists, return its value, otherwise return ""
    },
    setAttributeNS : function(namespaceURI, qualifiedName, value) {
        // call NamedNodeMap.getNamedItem
        //console.log('setAttributeNS %s %s %s', namespaceURI, qualifiedName, value);
        var attr = this.attributes.getNamedItem(namespaceURI, qualifiedName);

        if (!attr) {  // if Attribute exists, use it
            // otherwise create it
            attr = __ownerDocument__(this).createAttributeNS(namespaceURI, qualifiedName);
        }

        value = '' + value;

        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Attribute is readonly
            if (attr._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(this.ownerDocument, namespaceURI, qualifiedName, true)) {
                throw(new DOMException(DOMException.NAMESPACE_ERR));
            }

            // throw Exception if the value string contains an illegal character
            if (!__isValidString__(value)) {
                throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
        }

        // if this Attribute is an ID
        //if (__isIdDeclaration__(name)) {
        //    this.id = value;
        //}

        // assign values to properties (and aliases)
        attr.value     = value;
        attr.nodeValue = value;

        // delegate to NamedNodeMap.setNamedItem
        this.attributes.setNamedItemNS(attr);
    },
    removeAttributeNS : function(namespaceURI, localName) {
        // delegate to NamedNodeMap.removeNamedItemNS
        return this.attributes.removeNamedItemNS(namespaceURI, localName);
    },
    getAttributeNodeNS : function(namespaceURI, localName) {
        // delegate to NamedNodeMap.getNamedItemNS
        return this.attributes.getNamedItemNS(namespaceURI, localName);
    },
    setAttributeNodeNS : function(newAttr) {
        // if this Attribute is an ID
        if ((newAttr.prefix == "") &&  __isIdDeclaration__(newAttr.name)) {
            this.id = newAttr.value+'';  // cache ID for getElementById()
        }

        // delegate to NamedNodeMap.setNamedItemNS
        return this.attributes.setNamedItemNS(newAttr);
    },
    hasAttribute : function(name) {
        // delegate to NamedNodeMap._hasAttribute
        return __hasAttribute__(this.attributes,name);
    },
    hasAttributeNS : function(namespaceURI, localName) {
        // delegate to NamedNodeMap._hasAttributeNS
        return __hasAttributeNS__(this.attributes, namespaceURI, localName);
    },
    get nodeType(){
        return Node.ELEMENT_NODE;
    },
    get xml() {
        var ret = "",
            ns = "",
            attrs,
            attrstring,
            i;

        // serialize namespace declarations
        if (this.namespaceURI ){
            if((this === this.ownerDocument.documentElement) ||
               (!this.parentNode)||
               (this.parentNode && (this.parentNode.namespaceURI !== this.namespaceURI))) {
                ns = ' xmlns' + (this.prefix?(':'+this.prefix):'') +
                    '="' + this.namespaceURI + '"';
            }
        }

        // serialize Attribute declarations
        attrs = this.attributes;
        attrstring = "";
        for(i=0;i< attrs.length;i++){
            if(attrs[i].name.match('xmlns:')) {
                attrstring += " "+attrs[i].name+'="'+attrs[i].xml+'"';
            }
        }
        for(i=0;i< attrs.length;i++){
            if(!attrs[i].name.match('xmlns:')) {
                attrstring += " "+attrs[i].name+'="'+attrs[i].xml+'"';
            }
        }

        if(this.hasChildNodes()){
            // serialize this Element
            ret += "<" + this.tagName + ns + attrstring +">";
            ret += this.childNodes.xml;
            ret += "</" + this.tagName + ">";
        }else{
            ret += "<" + this.tagName + ns + attrstring +"/>";
        }

        return ret;
    },
    toString : function(){
        return '[object Element]';
    }
});
