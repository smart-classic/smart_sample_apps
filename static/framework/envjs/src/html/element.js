
/**
 * HTMLElement - DOM Level 2
 */


/* Hack for http://www.prototypejs.org/
 *
 * Prototype 1.6 (the library) creates a new global Element, which causes
 * envjs to use the wrong Element.
 *
 * http://envjs.lighthouseapp.com/projects/21590/tickets/108-prototypejs-wont-load-due-it-clobbering-element
 *
 * Options:
 *  (1) Rename the dom/element to something else
 *       rejected: been done before. people want Element.
 *  (2) merge dom+html and not export Element to global namespace
 *      (meaning we would use a local var Element in a closure, so prototype
 *      can do what ever it wants)
 *       rejected: want dom and html separate
 *  (3) use global namespace (put everything under Envjs = {})
 *       rejected: massive change
 *  (4) use commonjs modules (similar to (3) in spirit)
 *       rejected: massive change
 *
 *  or
 *
 *  (5) take a reference to Element during initial loading ("compile
 *      time"), and use the reference instead of "Element".  That's
 *      what the next line does.  We use __DOMElement__ if we need to
 *      reference the parent class.  Only this file explcity uses
 *      Element so this should work, and is the most minimal change I
 *      could think of with no external API changes.
 *
 */
var  __DOMElement__ = Element;

HTMLElement = function(ownerDocument) {
    __DOMElement__.apply(this, arguments);
};

HTMLElement.prototype = new Element();
__extend__(HTMLElement.prototype, HTMLEvents.prototype);
__extend__(HTMLElement.prototype, {
    get className() {
        return this.getAttribute("class")||'';
    },
    set className(value) {
        return this.setAttribute("class",__trim__(value));
    },
    get dir() {
        return this.getAttribute("dir")||"ltr";
    },
    set dir(val) {
        return this.setAttribute("dir",val);
    },
    get id(){
        return this.getAttribute('id') || '';
    },
    set id(id){
        this.setAttribute('id', id);
    },
    get innerHTML(){
        var ret = "",
        i;

        // create string containing the concatenation of the string
        // values of each child
        for (i=0; i < this.childNodes.length; i++) {
            if(this.childNodes[i]){
                if(this.childNodes[i].nodeType === Node.ELEMENT_NODE){
                    ret += this.childNodes[i].xhtml;
                } else if (this.childNodes[i].nodeType === Node.TEXT_NODE && i>0 &&
                           this.childNodes[i-1].nodeType === Node.TEXT_NODE){
                    //add a single space between adjacent text nodes
                    ret += " "+this.childNodes[i].xml;
                }else{
                    ret += this.childNodes[i].xml;
                }
            }
        }
        return ret;
    },
    get lang() {
        return this.getAttribute("lang");
    },
    set lang(val) {
        return this.setAttribute("lang",val);
    },
    get offsetHeight(){
        return Number((this.style.height || '').replace("px",""));
    },
    get offsetWidth(){
        return Number((this.style.width || '').replace("px",""));
    },
    offsetLeft: 0,
    offsetRight: 0,
    get offsetParent(){
        /* TODO */
        return;
    },
    set offsetParent(element){
        /* TODO */
        return;
    },
    scrollHeight: 0,
    scrollWidth: 0,
    scrollLeft: 0,
    scrollRight: 0,
    get style(){
        return this.getAttribute('style')||'';
    },
    get title() {
        return this.getAttribute("title");
    },
    set title(value) {
        return this.setAttribute("title", value);
    },
    get tabIndex(){
        var tabindex = this.getAttribute('tabindex');
        if(tabindex!==null){
            return Number(tabindex);
        } else {
            return 0;
        }
    },
    set tabIndex(value){
        if (value === undefined || value === null) {
            value = 0;
        }
        this.setAttribute('tabindex',Number(value));
    },
    get outerHTML(){
        //Not in the specs but I'll leave it here for now.
        return this.xhtml;
    },
    scrollIntoView: function(){
        /*TODO*/
        return;
    },
    toString: function(){
        return '[object HTMLElement]';
    },
    get xhtml() {
        // HTMLDocument.xhtml is non-standard
        // This is exactly like Document.xml except the tagName has to be
        // lower cased.  I dont like to duplicate this but its really not
        // a simple work around between xml and html serialization via
        // XMLSerializer (which uppercases html tags) and innerHTML (which
        // lowercases tags)

        var ret = "",
            ns = "",
            name = (this.tagName+"").toLowerCase(),
            attrs,
            attrstring = "",
			style = false,
            i;

        // serialize namespace declarations
        if (this.namespaceURI){
            if((this === this.ownerDocument.documentElement) ||
               (!this.parentNode) ||
               (this.parentNode &&
                (this.parentNode.namespaceURI !== this.namespaceURI))) {
                ns = ' xmlns' + (this.prefix ? (':' + this.prefix) : '') +
                    '="' + this.namespaceURI + '"';
            }
        }

        // serialize Attribute declarations
        attrs = this.attributes;
        for(i=0;i< attrs.length;i++){
            attrstring += " "+attrs[i].name+'="'+attrs[i].xml+'"';
			if(attrs[i].name == 'style'){
				style = true;
			}
        }
		if(!style ){
			style = this.getAttribute('style');
			if(style)
				attrstring += ' style="'+style+'"';
		}

        if(this.hasChildNodes()){
            // serialize this Element
	        //console.log('serializing childNodes for %s', name);
            ret += "<" + name + ns + attrstring +">";
            for(i=0;i< this.childNodes.length;i++){
                console.debug('xhtml for '+ this);
                ret += 'xhtml' in this.childNodes[i] ?
                    this.childNodes[i].xhtml :
                    this.childNodes[i].xml;
            }
            ret += "</" + name + ">";
        }else{	
            //console.log('no childNodes to serialize for %s', name);
            switch(name){
            case 'script':
            case 'noscript':
                ret += "<" + name + ns + attrstring +"></"+name+">";
                break;
            default:
                ret += "<" + name + ns + attrstring +"/>";
            }
        }

        return ret;
    },

    /**
     * setAttribute use a dispatch table that other tags can set to
     *  "listen" to various values being set.  The dispatch table
     * and registration functions are at the end of the file.
     *
     */

    setAttribute: function(name, value) {
        var result = __DOMElement__.prototype.setAttribute.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, name);
        if (callback) {
            callback(this, value);
        }
    },
    setAttributeNS: function(namespaceURI, name, value) {
        var result = __DOMElement__.prototype.setAttributeNS.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, name);
        if (callback) {
            callback(this, value);
        }

        return result;
    },
    setAttributeNode: function(newnode) {
        var result = __DOMElement__.prototype.setAttributeNode.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, newnode.name);
        if (callback) {
            callback(this, node.value);
        }
        return result;
    },
    setAttributeNodeNS: function(newnode) {
        var result = __DOMElement__.prototype.setAttributeNodeNS.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, newnode.name);
        if (callback) {
            callback(this, node.value);
        }
        return result;
    },
    removeAttribute: function(name) {
        __removeNamedMap__(this.ownerDocument, this);
        return __DOMElement__.prototype.removeAttribute.apply(this, arguments);
    },
    removeAttributeNS: function(namespace, localname) {
        __removeNamedMap__(this.ownerDocument, this);
        return __DOMElement__.prototype.removeAttributeNS.apply(this, arguments);
    },
    removeAttributeNode: function(name) {
        __removeNamedMap__(this.ownerDocument, this);
        return __DOMElement__.prototype.removeAttribute.apply(this, arguments);
    },
    removeChild: function(oldChild) {
        __removeNamedMap__(this.ownerDocument, oldChild);
        return __DOMElement__.prototype.removeChild.apply(this, arguments);
    },
    importNode: function(othernode, deep) {
        var newnode = __DOMElement__.prototype.importNode.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, newnode);
        return newnode;
    },

    // not actually sure if this is needed or not
    replaceNode: function(newchild, oldchild) {
        var newnode = __DOMElement__.prototype.replaceNode.apply(this, arguments);
        __removeNamedMap__(this.ownerDocument, oldchild);
        __addNamedMap__(this.ownerDocument, newnode);
                return newnode;
    }
});


HTMLElement.attributeCallbacks = {};
HTMLElement.registerSetAttribute = function(tag, attrib, callbackfn) {
    HTMLElement.attributeCallbacks[tag + ':set:' + attrib] = callbackfn;
};
HTMLElement.registerRemoveAttribute = function(tag, attrib, callbackfn) {
    HTMLElement.attributeCallbacks[tag + ':remove:' + attrib] = callbackfn;
};

/**
 * This is really only useful internally
 *
 */
HTMLElement.getAttributeCallback = function(type, tag, attrib) {
    return HTMLElement.attributeCallbacks[tag + ':' + type + ':' + attrib] || null;
};
