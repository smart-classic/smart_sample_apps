/**
 *
 * This file only handles XML parser.
 * It is extended by parser/domparser.js (and parser/htmlparser.js)
 *
 * This depends on e4x, which some engines may not have.
 *
 * @author thatcher
 */
DOMParser = function(principle, documentURI, baseURI) {
    // TODO: why/what should these 3 args do?
};
__extend__(DOMParser.prototype,{
    parseFromString: function(xmlstring, mimetype){
        var doc = new Document(new DOMImplementation()),
            e4;

        // The following are e4x directives.
        // Full spec is here:
        // http://www.ecma-international.org/publications/standards/Ecma-357.htm
        //
        // that is pretty gross, so checkout this summary
        // http://rephrase.net/days/07/06/e4x
        //
        // also see the Mozilla Developer Center:
        // https://developer.mozilla.org/en/E4X
        //
        XML.ignoreComments = false;
        XML.ignoreProcessingInstructions = false;
        XML.ignoreWhitespace = false;

        // for some reason e4x can't handle initial xml declarations
        // https://bugzilla.mozilla.org/show_bug.cgi?id=336551
        // The official workaround is the big regexp below
        // but simpler one seems to be ok
        // xmlstring = xmlstring.replace(/^<\?xml\s+version\s*=\s*(["'])[^\1]+\1[^?]*\?>/, "");
        //
        xmlstring = xmlstring.replace(/<\?xml.*\?>/, '');

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
        kind,
        item;
    //console.log('converting e4x node list \n %s', e4)

    // not using the for each(item in e4) since some engines can't
    // handle the syntax (i.e. says syntax error)
    //
    // for each(xnode in e4) {
    for (item in e4) {
        // NO do not do this if (e4.hasOwnProperty(item)) {
        // breaks spidermonkey
        xnode = e4[item];

        kind = xnode.nodeKind();
        //console.log('treating node kind %s', kind);
        switch(kind){
        case 'element':
            // add node
            //console.log('creating element %s %s', xnode.localName(), xnode.namespace());
            if(xnode.namespace() && (xnode.namespace()+'') !== ''){
                //console.log('createElementNS %s %s',xnode.namespace()+'', xnode.localName() );
                domnode = doc.createElementNS(xnode.namespace()+'', xnode.localName());
            }else{
                domnode = doc.createElement(xnode.name()+'');
            }
            parent.appendChild(domnode);

            // add attributes
            __toDomNode__(xnode.attributes(), domnode, doc);

            // add children
            children = xnode.children();
            length = children.length();
            //console.log('recursing? %s', length ? 'yes' : 'no');
            if (length > 0) {
                __toDomNode__(children, domnode, doc);
            }
            break;
        case 'attribute':
            // console.log('setting attribute %s %s %s',
            //       xnode.localName(), xnode.namespace(), xnode.valueOf());

            //
            // cross-platform alert.  The original code used
            //  xnode.text() to get the attribute value
            //  This worked in Rhino, but did not in Spidermonkey
            //  valueOf seemed to work in both
            //
            if(xnode.namespace() && xnode.namespace().prefix){
                //console.log("%s", xnode.namespace().prefix);
                parent.setAttributeNS(xnode.namespace()+'',
                                      xnode.namespace().prefix+':'+xnode.localName(),
                                      xnode.valueOf());
            }else if((xnode.name()+'').match('http://www.w3.org/2000/xmlns/::')){
                if(xnode.localName()!=='xmlns'){
                    parent.setAttributeNS('http://www.w3.org/2000/xmlns/',
                                          'xmlns:'+xnode.localName(),
                                          xnode.valueOf());
                }
            }else{
                parent.setAttribute(xnode.localName()+'', xnode.valueOf());
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
            value = value.split(' ').splice(1).join(' ').replace('?>','');
            //console.log('creating processing-instruction data : %s', value);
            domnode = doc.createProcessingInstruction(target, value);
            parent.appendChild(domnode);
            break;
        default:
            console.log('e4x DOM ERROR');
            throw new Error("Assertion failed in xml parser");
        }
    }
};
