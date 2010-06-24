
/**
* HTMLElement - DOM Level 2
*/
HTMLElement = function(ownerDocument) {
    Element.apply(this, arguments);
};
HTMLElement.prototype = new Element;
//TODO: Not sure where HTMLEvents belongs in the chain
//      but putting it here satisfies a lowest common 
//      denominator.
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
	    return this.getAttribute('id'); 
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
                }else if(this.childNodes[i].nodeType == Node.TEXT_NODE && i>0 && 
                    this.childNodes[i-1].nodeType == Node.TEXT_NODE){
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
	    return Number((this.style["height"]||'').replace("px",""));
	},
	get offsetWidth(){
	    return Number((this.style["width"]||'').replace("px",""));
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
        if(value===undefined||value===null)
            value = 0;
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
            i;

        // serialize namespace declarations
        if (this.namespaceURI){
            if((this === this.ownerDocument.documentElement) ||
                (!this.parentNode)||
                (this.parentNode && 
                (this.parentNode.namespaceURI !== this.namespaceURI)))
                ns = ' xmlns'+(this.prefix?(':'+this.prefix):'')+
                    '="'+this.namespaceURI+'"';
        }
        
        // serialize Attribute declarations
        attrs = this.attributes;
        for(i=0;i< attrs.length;i++){
            attrstring += " "+attrs[i].name+'="'+attrs[i].xml+'"';
        }
        
        if(this.hasChildNodes()){
            // serialize this Element
            ret += "<" + name + ns + attrstring +">";
            for(i=0;i< this.childNodes.length;i++){
                ret += this.childNodes[i].xhtml ?
                           this.childNodes[i].xhtml : 
                           this.childNodes[i].xml
            }
            ret += "</" + name + ">";
        }else{
            switch(name){
                case 'script':
                    ret += "<" + name + ns + attrstring +"></"+name+">";
                default:
                    ret += "<" + name + ns + attrstring +"/>";
            }
        }
        
        return ret;
    }
});

