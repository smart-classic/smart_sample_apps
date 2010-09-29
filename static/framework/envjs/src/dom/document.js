
/*
 * Forward declarations
 */
var __isValidNamespace__;

/**
 * @class  Document - The Document interface represents the entire HTML
 *      or XML document. Conceptually, it is the root of the document tree,
 *      and provides the primary access to the document's data.
 *
 * @extends Node
 * @param  implementation : DOMImplementation - the creator Implementation
 */
Document = function(implementation, docParentWindow) {
    Node.apply(this, arguments);

    //TODO: Temporary!!! Cnage back to true!!!
    this.async = true;
    // The Document Type Declaration (see DocumentType) associated with this document
    this.doctype = null;
    // The DOMImplementation object that handles this document.
    this.implementation = implementation;

    this.nodeName  = "#document";
    // initially false, set to true by parser
    this.parsing = false;
    this.baseURI = 'about:blank';

    this.ownerDocument = null;

    this.importing = false;
};

Document.prototype = new Node();
__extend__(Document.prototype,{
    get localName(){
        return null;
    },
    get textContent(){
        return null;
    },
    get all(){
        return this.getElementsByTagName("*");
    },
    get documentElement(){
        var i, length = this.childNodes?this.childNodes.length:0;
        for(i=0;i<length;i++){
            if(this.childNodes[i].nodeType === Node.ELEMENT_NODE){
                return this.childNodes[i];
            }
        }
        return null;
    },
    get documentURI(){
        return this.baseURI;
    },
    createExpression: function(xpath, nsuriMap){
        return new XPathExpression(xpath, nsuriMap);
    },
    createDocumentFragment: function() {
        var node = new DocumentFragment(this);
        return node;
    },
    createTextNode: function(data) {
        var node = new Text(this);
        node.data = data;
        return node;
    },
    createComment: function(data) {
        var node = new Comment(this);
        node.data = data;
        return node;
    },
    createCDATASection : function(data) {
        var node = new CDATASection(this);
        node.data = data;
        return node;
    },
    createProcessingInstruction: function(target, data) {
        // throw Exception if the target string contains an illegal character
        if (__ownerDocument__(this).implementation.errorChecking &&
            (!__isValidName__(target))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
        }

        var node = new ProcessingInstruction(this);
        node.target = target;
        node.data = data;
        return node;
    },
    createElement: function(tagName) {
        // throw Exception if the tagName string contains an illegal character
        if (__ownerDocument__(this).implementation.errorChecking &&
            (!__isValidName__(tagName))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
        }
        var node = new Element(this);
        node.nodeName = tagName;
        return node;
    },
    createElementNS : function(namespaceURI, qualifiedName) {
        //we use this as a parser flag to ignore the xhtml
        //namespace assumed by the parser
        //console.log('creating element %s %s', namespaceURI, qualifiedName);
        if(this.baseURI === 'http://envjs.com/xml' &&
            namespaceURI === 'http://www.w3.org/1999/xhtml'){
            return this.createElement(qualifiedName);
        }
        //console.log('createElementNS %s %s', namespaceURI, qualifiedName);
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(this, namespaceURI, qualifiedName)) {
                throw(new DOMException(DOMException.NAMESPACE_ERR));
            }

            // throw Exception if the qualifiedName string contains an illegal character
            if (!__isValidName__(qualifiedName)) {
                throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
        }
        var node  = new Element(this);
        var qname = __parseQName__(qualifiedName);
        node.namespaceURI = namespaceURI;
        node.prefix       = qname.prefix;
        node.nodeName     = qualifiedName;

        //console.log('created element %s %s', namespaceURI, qualifiedName);
        return node;
    },
    createAttribute : function(name) {
        //console.log('createAttribute %s ', name);
        // throw Exception if the name string contains an illegal character
        if (__ownerDocument__(this).implementation.errorChecking &&
            (!__isValidName__(name))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
        }
        var node = new Attr(this);
        node.nodeName = name;
        return node;
    },
    createAttributeNS : function(namespaceURI, qualifiedName) {
        //we use this as a parser flag to ignore the xhtml
        //namespace assumed by the parser
        if(this.baseURI === 'http://envjs.com/xml' &&
            namespaceURI === 'http://www.w3.org/1999/xhtml'){
            return this.createAttribute(qualifiedName);
        }
        //console.log('createAttributeNS %s %s', namespaceURI, qualifiedName);
        // test for exceptions
        if (this.implementation.errorChecking) {
            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(this, namespaceURI, qualifiedName, true)) {
                throw(new DOMException(DOMException.NAMESPACE_ERR));
            }

            // throw Exception if the qualifiedName string contains an illegal character
            if (!__isValidName__(qualifiedName)) {
                throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
        }
        var node  = new Attr(this);
        var qname = __parseQName__(qualifiedName);
        node.namespaceURI = namespaceURI === '' ? null : namespaceURI;
        node.prefix       = qname.prefix;
        node.nodeName     = qualifiedName;
        node.nodeValue    = "";
        //console.log('attribute %s %s %s', node.namespaceURI, node.prefix, node.nodeName);
        return node;
    },
    createNamespace : function(qualifiedName) {
        //console.log('createNamespace %s', qualifiedName);
        // create Namespace specifying 'this' as ownerDocument
        var node  = new Namespace(this);
        var qname = __parseQName__(qualifiedName);

        // assign values to properties (and aliases)
        node.prefix       = qname.prefix;
        node.localName    = qname.localName;
        node.name         = qualifiedName;
        node.nodeValue    = "";

        return node;
    },

    createRange: function(){
        return new Range();
    },

    evaluate: function(xpathText, contextNode, nsuriMapper, resultType, result){
        //return new XPathExpression().evaluate();
        throw Error('Document.evaluate not supported yet!');
    },

    getElementById : function(elementId) {
        var retNode = null,
            node;
        // loop through all Elements
        var all = this.getElementsByTagName('*');
        for (var i=0; i < all.length; i++) {
            node = all[i];
            // if id matches
            if (node.id == elementId) {
                //found the node
                retNode = node;
                break;
            }
        }
        return retNode;
    },
    normalizeDocument: function(){
        this.normalize();
    },
    get nodeType(){
        return Node.DOCUMENT_NODE;
    },
    get xml(){
        return this.documentElement.xml;
    },
    toString: function(){
        return "[object XMLDocument]";
    },
    get defaultView(){
        return { getComputedStyle: function(elem){
            return window.getComputedStyle(elem);
        }};
    },
});

/*
 * Helper function
 *
 */
__isValidNamespace__ = function(doc, namespaceURI, qualifiedName, isAttribute) {

    if (doc.importing === true) {
        //we're doing an importNode operation (or a cloneNode) - in both cases, there
        //is no need to perform any namespace checking since the nodes have to have been valid
        //to have gotten into the DOM in the first place
        return true;
    }

    var valid = true;
    // parse QName
    var qName = __parseQName__(qualifiedName);


    //only check for namespaces if we're finished parsing
    if (this.parsing === false) {

        // if the qualifiedName is malformed
        if (qName.localName.indexOf(":") > -1 ){
            valid = false;
        }

        if ((valid) && (!isAttribute)) {
            // if the namespaceURI is not null
            if (!namespaceURI) {
                valid = false;
            }
        }

        // if the qualifiedName has a prefix
        if ((valid) && (qName.prefix === "")) {
            valid = false;
        }
    }

    // if the qualifiedName has a prefix that is "xml" and the namespaceURI is
    //  different from "http://www.w3.org/XML/1998/namespace" [Namespaces].
    if ((valid) && (qName.prefix === "xml") && (namespaceURI !== "http://www.w3.org/XML/1998/namespace")) {
        valid = false;
    }

    return valid;
};
