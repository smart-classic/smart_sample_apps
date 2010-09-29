
/**
 * @class  HTMLDocument
 *      The Document interface represents the entire HTML or XML document.
 *      Conceptually, it is the root of the document tree, and provides
 *      the primary access to the document's data.
 *
 * @extends Document
 */
HTMLDocument = function(implementation, ownerWindow, referrer) {
    Document.apply(this, arguments);
    this.referrer = referrer || '';
    this.baseURI = "about:blank";
    this.ownerWindow = ownerWindow;
};

HTMLDocument.prototype = new Document();

__extend__(HTMLDocument.prototype, {
    createElement: function(tagName){
        var node;
        tagName = tagName.toUpperCase();
        // create Element specifying 'this' as ownerDocument
        // This is an html document so we need to use explicit interfaces per the
        //TODO: would be much faster as a big switch
        switch(tagName){
        case "A":
            node = new HTMLAnchorElement(this);break;
        case "AREA":
            node = new HTMLAreaElement(this);break;
        case "BASE":
            node = new HTMLBaseElement(this);break;
        case "BLOCKQUOTE":
            node = new HTMLQuoteElement(this);break;
        case "CANVAS":
            node = new HTMLCanvasElement(this);break;
        case "Q":
            node = new HTMLQuoteElement(this);break;
        case "BODY":
            node = new HTMLBodyElement(this);break;
        case "BR":
            node = new HTMLBRElement(this);break;
        case "BUTTON":
            node = new HTMLButtonElement(this);break;
        case "CAPTION":
            node = new HTMLElement(this);break;
        case "COL":
            node = new HTMLTableColElement(this);break;
        case "COLGROUP":
            node = new HTMLTableColElement(this);break;
        case "DEL":
            node = new HTMLModElement(this);break;
        case "INS":
            node = new HTMLModElement(this);break;
        case "DIV":
            node = new HTMLDivElement(this);break;
        case "DL":
            node = new HTMLDListElement(this);break;
        case "DT":
            node = new HTMLElement(this); break;
        case "FIELDSET":
            node = new HTMLFieldSetElement(this);break;
        case "FORM":
            node = new HTMLFormElement(this);break;
        case "FRAME":
            node = new HTMLFrameElement(this);break;
        case "FRAMESET":
            node = new HTMLFrameSetElement(this);break;
        case "H1":
            node = new HTMLHeadingElement(this);break;
        case "H2":
            node = new HTMLHeadingElement(this);break;
        case "H3":
            node = new HTMLHeadingElement(this);break;
        case "H4":
            node = new HTMLHeadingElement(this);break;
        case "H5":
            node = new HTMLHeadingElement(this);break;
        case "H6":
            node = new HTMLHeadingElement(this);break;
        case "HEAD":
            node = new HTMLHeadElement(this);break;
        case "HR":
            node = new HTMLHRElement(this);break;
        case "HTML":
            node = new HTMLHtmlElement(this);break;
        case "IFRAME":
            node = new HTMLIFrameElement(this);break;
        case "IMG":
            node = new HTMLImageElement(this);break;
        case "INPUT":
            node = new HTMLInputElement(this);break;
        case "LABEL":
            node = new HTMLLabelElement(this);break;
        case "LEGEND":
            node = new HTMLLegendElement(this);break;
        case "LI":
            node = new HTMLLIElement(this);break;
        case "LINK":
            node = new HTMLLinkElement(this);break;
        case "MAP":
            node = new HTMLMapElement(this);break;
        case "META":
            node = new HTMLMetaElement(this);break;
        case "NOSCRIPT":
            node = new HTMLElement(this);break;
        case "OBJECT":
            node = new HTMLObjectElement(this);break;
        case "OPTGROUP":
            node = new HTMLOptGroupElement(this);break;
        case "OL":
            node = new HTMLOListElement(this); break;
        case "OPTION":
            node = new HTMLOptionElement(this);break;
        case "P":
            node = new HTMLParagraphElement(this);break;
        case "PARAM":
            node = new HTMLParamElement(this);break;
        case "PRE":
            node = new HTMLPreElement(this);break;
        case "SCRIPT":
            node = new HTMLScriptElement(this);break;
        case "SELECT":
            node = new HTMLSelectElement(this);break;
        case "SMALL":
            node = new HTMLElement(this);break;
        case "SPAN":
            node = new HTMLSpanElement(this);break;
        case "STRONG":
            node = new HTMLElement(this);break;
        case "STYLE":
            node = new HTMLStyleElement(this);break;
        case "TABLE":
            node = new HTMLTableElement(this);break;
        case "TBODY":
            node = new HTMLTableSectionElement(this);break;
        case "TFOOT":
            node = new HTMLTableSectionElement(this);break;
        case "THEAD":
            node = new HTMLTableSectionElement(this);break;
        case "TD":
            node = new HTMLTableDataCellElement(this);break;
        case "TH":
            node = new HTMLTableHeaderCellElement(this);break;
        case "TEXTAREA":
            node = new HTMLTextAreaElement(this);break;
        case "TITLE":
            node = new HTMLTitleElement(this);break;
        case "TR":
            node = new HTMLTableRowElement(this);break;
        case "UL":
            node = new HTMLUListElement(this);break;
        default:
            node = new HTMLUnknownElement(this);
        }
        // assign values to properties (and aliases)
        node.nodeName  = tagName;
        return node;
    },
    createElementNS : function (uri, local) {
        //print('createElementNS :'+uri+" "+local);
        if(!uri){
            return this.createElement(local);
        }else if ("http://www.w3.org/1999/xhtml" == uri) {
            return this.createElement(local);
        } else if ("http://www.w3.org/1998/Math/MathML" == uri) {
            return this.createElement(local);
        } else if ("http://www.w3.org/2000/svg" == uri) {
 			return this.createElement(local);
		} else {
            return Document.prototype.createElementNS.apply(this,[uri, local]);
        }
    },
    get anchors(){
        return new HTMLCollection(this.getElementsByTagName('a'));
    },
    get applets(){
        return new HTMLCollection(this.getElementsByTagName('applet'));
    },
    get documentElement(){
        var html = Document.prototype.__lookupGetter__('documentElement').apply(this,[]);
        if( html === null){
            html = this.createElement('html');
            this.appendChild(html);
            html.appendChild(this.createElement('head'));
            html.appendChild(this.createElement('body'));
        }
        return html;
    },
    //document.head is non-standard
    get head(){
        //console.log('get head');
        if (!this.documentElement) {
            this.appendChild(this.createElement('html'));
        }
        var element = this.documentElement,
        	length = element.childNodes.length,
	        i;
        //check for the presence of the head element in this html doc
        for(i=0;i<length;i++){
            if(element.childNodes[i].nodeType === Node.ELEMENT_NODE){
                if(element.childNodes[i].tagName.toLowerCase() === 'head'){
                    return element.childNodes[i];
                }
            }
        }
        //no head?  ugh bad news html.. I guess we'll force the issue?
        var head = element.appendChild(this.createElement('head'));
        return head;
    },
    get title(){
        //console.log('get title');
        if (!this.documentElement) {
            this.appendChild(this.createElement('html'));
        }
        var title,
        	head = this.head,
	        length = head.childNodes.length,
	        i;
        //check for the presence of the title element in this head element
        for(i=0;i<length;i++){
            if(head.childNodes[i].nodeType === Node.ELEMENT_NODE){
                if(head.childNodes[i].tagName.toLowerCase() === 'title'){
                    return head.childNodes[i].textContent;
                }
            }
        }
        //no title?  ugh bad news html.. I guess we'll force the issue?
        title = head.appendChild(this.createElement('title'));
        return title.appendChild(this.createTextNode('Untitled Document')).nodeValue;
    },
    set title(titleStr){
        //console.log('set title %s', titleStr);
        if (!this.documentElement) {
            this.appendChild(this.createElement('html'));
        }
        var title = this.title;
        title.textContent = titleStr;
    },

    get body() {
        var element = this.documentElement,
            length = element.childNodes.length,
            i;
        for (i=0; i<length; i++) {
            if (element.childNodes[i].nodeType === Node.ELEMENT_NODE &&
                (element.childNodes[i].tagName === 'BODY' || 
				 element.childNodes[i].tagName === 'FRAMESET')) {
                return element.childNodes[i];
            }
        }
        return null;
    },
    set body() {
        /* in firefox this is a benevolent do nothing*/
        console.log('set body');
    },

    get cookie(){
        return Envjs.getCookies(this.location+'');
    },
    set cookie(cookie){
        return Envjs.setCookie(this.location+'', cookie);
    },

    /**
     * document.location
     *
     * should be identical to window.location
     *
     * HTML5:
     * http://dev.w3.org/html5/spec/Overview.html#the-location-interface
     *
     * Mozilla MDC:
     * https://developer.mozilla.org/en/DOM/document.location
     *
     */
    get location() {
        if (this.ownerWindow) {
            return this.ownerWindow.location;
        } else {
            return this.baseURI;
        }
    },
    set location(url) {
        this.baseURI = url;
        if (this.ownerWindow) {
            this.ownerWindow.location = url;
        }
    },

    /**
     * document.URL (read-only)
     *
     * HTML DOM Level 2:
     * http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-46183437
     *
     * HTML5:
     * http://dev.w3.org/html5/spec/Overview.html#dom-document-url
     *
     * Mozilla MDC:
     * https://developer.mozilla.org/en/DOM/document.URL
     */
    get URL() {
        return this.location.href;
    },

    /**
     * document.domain
     *
     * HTML5 Spec:
     * http://dev.w3.org/html5/spec/Overview.html#dom-document-domain
     *
     * Mozilla MDC:
     * https://developer.mozilla.org/en/DOM/document.domain
     *
     */
    get domain(){
        var HOSTNAME = new RegExp('\/\/([^\:\/]+)'),
        matches = HOSTNAME.exec(this.baseURI);
        return matches&&matches.length>1?matches[1]:"";
    },
    set domain(value){
        var i,
        domainParts = this.domain.split('.').reverse(),
        newDomainParts = value.split('.').reverse();
        if(newDomainParts.length > 1){
            for(i=0;i<newDomainParts.length;i++){
                if(!(newDomainParts[i] === domainParts[i])){
                    return;
                }
            }
            this.baseURI = this.baseURI.replace(domainParts.join('.'), value);
        }
    },

    get forms(){
        return new HTMLCollection(this.getElementsByTagName('form'));
    },
    get images(){
        return new HTMLCollection(this.getElementsByTagName('img'));
    },
    get lastModified(){
        /* TODO */
        return this._lastModified;
    },
    get links(){
        return new HTMLCollection(this.getElementsByTagName('a'));
    },
    getElementsByName : function(name){
        //returns a real Array + the NodeList
        var retNodes = __extend__([],new NodeList(this, this.documentElement)),
        node;
        // loop through all Elements
        var all = this.getElementsByTagName('*');
        for (var i=0; i < all.length; i++) {
            node = all[i];
            if (node.nodeType === Node.ELEMENT_NODE &&
                node.getAttribute('name') == name) {
                retNodes.push(node);
            }
        }
        return retNodes;
    },
    toString: function(){
        return "[object HTMLDocument]";
    },
    get innerHTML(){
        return this.documentElement.outerHTML;
    }
});



Aspect.around({
    target: Node,
    method:"appendChild"
}, function(invocation) {
    var event,
        okay,
        node = invocation.proceed(),
        doc = node.ownerDocument,
		target;

    //console.log('element appended: %s %s %s', node+'', node.nodeName, node.namespaceURI);
    if((node.nodeType !== Node.ELEMENT_NODE)){
        //for now we are only handling element insertions.  probably
        //we will need to handle text node changes to script tags and
        //changes to src attributes
        return node;
    }
	
	if(node.tagName&&node.tagName.toLowerCase()=="input"){
		target = node.parentNode;
		//console.log('adding named map for input');
		while(target&&target.tagName&&target.tagName.toLowerCase()!="form"){
			//console.log('possible target for named map for input is %s', target);
			target = target.parentNode;
		}
		if(target){
			//console.log('target for named map for input is %s', target);
			__addNamedMap__(target, node);
		}
	}
    //console.log('appended html element %s %s %s', node.namespaceURI, node.nodeName, node);
    switch(doc.parsing){
        case true:

        /**
         * Very special case.  While in parsing mode, in head, a
         * script can add another script tag to the head, and it will
         * be evaluated.  This is tested in 'ant fulldoc-spec' tests.
         *
         * Not quite sure if the require that the new script tag must
         * be in the head is correct or not.  NamespaceURI == null
         * might also need to corrected too.
         */
        if (node.tagName.toLowerCase() === 'script' && 
			(node.namespaceURI === "" || 
			 node.namespaceURI === "http://www.w3.org/1999/xhtml" || 
			 node.namespaceURI === null) ) {
            //console.log('appending script while parsing');
            if((this.nodeName.toLowerCase() === 'head')){
                try{
                    okay = Envjs.loadLocalScript(node, null);
                    //console.log('loaded script? %s %s', node.uuid, okay);
                    // only fire event if we actually had something to load
                    if (node.src && node.src.length > 0){
                        event = doc.createEvent('HTMLEvents');
                        event.initEvent( okay ? "load" : "error", false, false );
                        node.dispatchEvent( event, false );
                    }
                }catch(e){
                    console.log('error loading html element %s %e', node, e.toString());
                }
            }
        }
        break;
        case false:
            switch(node.namespaceURI){
                case null:
                    //fall through
                case "":
                    //fall through
                case "http://www.w3.org/1999/xhtml":
                    switch(node.tagName.toLowerCase()){
                    case 'style':
                        document.styleSheets.push(CSSStyleSheet(node));
                        break;
                    case 'script':
                        //console.log('appending script %s', node.src);
                        if((this.nodeName.toLowerCase() === 'head')){
                            try{
                                okay = Envjs.loadLocalScript(node, null);
                                //console.log('loaded script? %s %s', node.uuid, okay);
                                // only fire event if we actually had something to load
                                if (node.src && node.src.length > 0){
                                    event = doc.createEvent('HTMLEvents');
                                    event.initEvent( okay ? "load" : "error", false, false );
                                    node.dispatchEvent( event, false );
                                }
                            }catch(e){
                                console.log('error loading html element %s %e', node, e.toString());
                            }
                        }
                        break;
                    case 'frame':
                    case 'iframe':
                        node.contentWindow = { };
                        node.contentDocument = new HTMLDocument(new DOMImplementation(), node.contentWindow);
                        node.contentWindow.document = node.contentDocument;
                        try{
                            Window;
                        }catch(e){
                            node.contentDocument.addEventListener('DOMContentLoaded', function(){
                                event = node.contentDocument.createEvent('HTMLEvents');
                                event.initEvent("load", false, false);
                                node.dispatchEvent( event, false );
                            });
                            console.log('error loading html element %s %e', node, e.toString());
                        }
                        try{
                            if (node.src && node.src.length > 0){
                                //console.log("trigger load on frame from appendChild %s", node.src);
                                Envjs.loadFrame(node, Envjs.uri(node.src, doc.location+''));
                            }else{
                                Envjs.loadFrame(node);
                            }
                        }catch(e){
                            console.log('error loading html element %s %e', node, e.toString());
                        }
                        break;

                    case 'link':
                        if (node.href && node.href.length > 0) {
                            __loadLink__(node, node.href);
                        }
                        break;
                        /*
                          case 'img':
                          if (node.src && node.src.length > 0){
                          // don't actually load anything, so we're "done" immediately:
                          event = doc.createEvent('HTMLEvents');
                          event.initEvent("load", false, false);
                          node.dispatchEvent( event, false );
                          }
                          break;
                        */
                    case 'option':
                        node._updateoptions();
                        break;
                    default:
                        if(node.getAttribute('onload')){
                            //console.log('calling attribute onload %s | %s', node.onload, node.tagName);
                            node.onload();
                        }
                        break;
                    }//switch on name
                default:
                    break;
            }//switch on ns
            break;
        default:
            // console.log('element appended: %s %s', node+'', node.namespaceURI);
    }//switch on doc.parsing
    return node;

});

Aspect.around({
    target: Node,
    method:"removeChild"
}, function(invocation) {
    var event,
        okay,
        node = invocation.proceed(),
        doc = node.ownerDocument;
    if((node.nodeType !== Node.ELEMENT_NODE)){
        //for now we are only handling element insertions.  probably we will need
        //to handle text node changes to script tags and changes to src
        //attributes
        if(node.nodeType !== Node.DOCUMENT_NODE && node.uuid){
            //console.log('removing event listeners, %s', node, node.uuid);
            node.removeEventListener('*', null, null);
        }
        return node;
    }
    //console.log('appended html element %s %s %s', node.namespaceURI, node.nodeName, node);
	if(node.tagName&&node.tagName.toLowerCase()=="input"){
		target = node.parentNode;
		//console.log('adding named map for input');
		while(target&&target.tagName&&target.tagName.toLowerCase()!="form"){
			//console.log('possible target for named map for input is %s', target);
			target = target.parentNode;
		}
		if(target){
			//console.log('target for named map for input is %s', target);
			__removeNamedMap__(target, node);
		}
	}
    switch(doc.parsing){
        case true:
            //handled by parser if included
            break;
        case false:
            switch(node.namespaceURI){
            case null:
                //fall through
            case "":
                //fall through
            case "http://www.w3.org/1999/xhtml":
                //this is interesting dillema since our event engine is
                //storing the registered events in an array accessed
                //by the uuid property of the node.  unforunately this
                //means listeners hang out way after(forever ;)) the node
                //has been removed and gone out of scope.
                //console.log('removing event listeners, %s', node, node.uuid);
                node.removeEventListener('*', null, null);
                switch(node.tagName.toLowerCase()){
                case 'frame':
                case 'iframe':
                    try{
                        //console.log('removing iframe document');
                        try{
                            Envjs.unloadFrame(node);
                        }catch(e){
                            console.log('error freeing resources from frame %s', e);
                        }
                        node.contentWindow = null;
                        node.contentDocument = null;
                    }catch(e){
                        console.log('error unloading html element %s %e', node, e.toString());
                    }
                    break;
                default:
                    break;
                }//switch on name
            default:
                break;
            }//switch on ns
            break;
        default:
            console.log('element appended: %s %s', node+'', node.namespaceURI);
    }//switch on doc.parsing
    return node;

});



/**
 * Named Element Support
 *
 *
 */

/*
 *
 * @returns 'name' if the node has a appropriate name
 *          null if node does not have a name
 */

var __isNamedElement__ = function(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }
    var tagName = node.tagName.toLowerCase();
    var nodename = null;

    switch (tagName) {
        case 'embed':
        case 'form':
        case 'iframe':
		case 'input':
            nodename = node.getAttribute('name');
            break;
        case 'applet':
            nodename = node.id;
            break;
        case 'object':
            // TODO: object needs to be 'fallback free'
            nodename = node.id;
            break;
        case 'img':
            nodename = node.id;
            if (!nodename || ! node.getAttribute('name')) {
                nodename = null;
            }
            break;
    }
    return (nodename) ? nodename : null;
};


var __addNamedMap__ = function(target, node) {
    var nodename = __isNamedElement__(node);
    if (nodename) {
       	target.__defineGetter__(nodename, function() {
            return node;
        });	
		target.__defineSetter__(nodename, function(value) {
	        return value;
	    });
    }
};

var __removeNamedMap__ = function(target, node) {
    if (!node) {
        return;
    }
    var nodename = __isNamedElement__(node);
    if (nodename) {
		delete target[nodename];
    }
};
