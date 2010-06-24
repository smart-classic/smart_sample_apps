/**
 * @author thatcher
 */
DOMParser = function(principle, documentURI, baseURI){};
__extend__(DOMParser.prototype,{
    parseFromString: function(xmlstring, mimetype){
        var doc = new Document(new DOMImplementation()),
            e4;
        
        XML.ignoreComments = false;
        XML.ignoreProcessingInstructions = false;
        XML.ignoreWhitespace = false;
        
        xmlstring = xmlstring.replace(/<\?xml.*\?>/);
        
        e4 = new XMLList(xmlstring);
        
        __toDomNode__(e4, doc, doc);
        
        //console.log('xml \n %s', doc.documentElement.xml);
        return doc;
        
    }
});

var __toDomNode__ = function(e4, parent, doc){
    var xnode, 
        domnode,
        children,
        target,
        value,
        length,
        element,
        kind;
    //console.log('converting e4x node list \n %s', e4)
    for each(xnode in e4){
        kind = xnode.nodeKind(); 
        //console.log('treating node kind %s', kind);
        switch(kind){
            case 'element':
                //console.log('creating element %s %s', xnode.localName(), xnode.namespace());
                if(xnode.namespace() && (xnode.namespace()+'') !== ''){
                    //console.log('createElementNS %s %s',xnode.namespace()+'', xnode.localName() );
                    domnode = doc.createElementNS(xnode.namespace()+'', xnode.localName());
                }else{
                    domnode = doc.createElement(xnode.name()+'');
                }
                parent.appendChild(domnode);
                 __toDomNode__(xnode.attributes(), domnode, doc);
                length = xnode.children().length();
                //console.log('recursing? %s', length?"yes":"no");
                if(xnode.children().length()>0){
                    __toDomNode__(xnode.children(), domnode, doc);
                }
                break;
            case 'attribute':
                //console.log('setting attribute %s %s %s', 
                //    xnode.localName(), xnode.namespace(), xnode.text());
                if(xnode.namespace() && xnode.namespace().prefix){
                    //console.log("%s", xnode.namespace().prefix);
                    parent.setAttributeNS(xnode.namespace()+'', 
                        xnode.namespace().prefix+':'+xnode.localName(), 
                        xnode.text());
                }else if((xnode.name()+'').match("http://www.w3.org/2000/xmlns/::")){
                    if(xnode.localName()!=='xmlns'){
                        parent.setAttributeNS('http://www.w3.org/2000/xmlns/', 
                            'xmlns:'+xnode.localName(), 
                            xnode.text());
                    }
                }else{
                    parent.setAttribute(xnode.localName()+'', xnode.text());
                }
                break;
            case 'text':
                //console.log('creating text node : %s', xnode);
                domnode = doc.createTextNode(xnode+'');
                parent.appendChild(domnode);
                break;
            case 'comment':
                //console.log('creating comment node : %s', xnode);
                value = xnode+'';
                domnode = doc.createComment(value.substring(4,value.length-3));
                parent.appendChild(domnode);
                break;
            case 'processing-instruction':
                //console.log('creating processing-instruction node : %s', xnode);
                value = xnode+'';
                target = value.split(' ')[0].substring(2);
                value = value.split(' ').splice(1).join(" ").replace('?>','');
                //console.log('creating processing-instruction data : %s', value);
                domnode = doc.createProcessingInstruction(target, value);
                parent.appendChild(domnode);
                break;
        }
    }
}; 