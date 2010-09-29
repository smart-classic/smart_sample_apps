
/**
* DOMParser
*/

__defineParser__(function(e){
    console.log('Error loading html 5 parser implementation');
}, 'nu_validator_htmlparser_HtmlParser', '');

/*DOMParser = function(principle, documentURI, baseURI){};
__extend__(DOMParser.prototype,{
    parseFromString: function(xmlstring, mimetype){
        //console.log('DOMParser.parseFromString %s', mimetype);
        var xmldoc = new Document(new DOMImplementation());
        return XMLParser.parseDocument(xmlstring, xmldoc, mimetype);
    }
});*/

XMLParser.parseDocument = function(xmlstring, xmldoc, mimetype){
    //console.log('XMLParser.parseDocument');
    var tmpdoc = new Document(new DOMImplementation()),
        parent,
        importedNode,
        tmpNode;

    if(mimetype && mimetype == 'text/xml'){
        //console.log('mimetype: text/xml');
        tmpdoc.baseURI = 'http://envjs.com/xml';
        xmlstring = '<html><head></head><body>'+
            '<envjs_1234567890 xmlns="envjs_1234567890">'
                +xmlstring+
            '</envjs_1234567890>'+
        '</body></html>';
        Envjs.parseHtmlDocument(xmlstring, tmpdoc, false, null, null);
        parent = tmpdoc.getElementsByTagName('envjs_1234567890')[0];
    }else{
        Envjs.parseHtmlDocument(xmlstring, tmpdoc, false, null, null);
        parent = tmpdoc.documentElement;
    }

    while(xmldoc.firstChild != null){
        xmldoc.removeChild( xmldoc.firstChild );
    }
    while(parent.firstChild != null){
        tmpNode  = parent.removeChild( parent.firstChild );
        importedNode = xmldoc.importNode( tmpNode, true);
        xmldoc.appendChild( importedNode );
    }
    return xmldoc;
};

var __fragmentCache__ = {length:0},
    __cachable__ = 255;

HTMLParser.parseDocument = function(htmlstring, htmldoc){
    //console.log('HTMLParser.parseDocument %s', htmldoc.async);
    htmldoc.parsing = true;
    Envjs.parseHtmlDocument(htmlstring, htmldoc, htmldoc.async, null, null);
    //Envjs.wait();
    //console.log('Finished HTMLParser.parseDocument %s', htmldoc.async);
    return htmldoc;
};
HTMLParser.parseFragment = function(htmlstring, element){
    //console.log('HTMLParser.parseFragment')
    // fragment is allowed to be an element as well
    var tmpdoc,
        parent,
        importedNode,
        tmpNode,
        length,
        i,
        docstring;
    //console.log('parsing fragment: %s', htmlstring);
    //console.log('__fragmentCache__.length %s', __fragmentCache__.length)
    if( htmlstring.length > __cachable__ && htmlstring in __fragmentCache__){
        tmpdoc = __fragmentCache__[htmlstring];
    }else{
        //console.log('parsing html fragment \n%s', htmlstring);
        tmpdoc = new HTMLDocument(new DOMImplementation());


        // Need some indicator that this document isn't THE document
        // to fire off img.src change events and other items.
        // Otherwise, what happens is the tmpdoc fires and img.src
        // event, then when it's all imported to the original document
        // it happens again.

        tmpdoc.fragment = true;

        //preserves leading white space
        docstring = '<html><head></head><body>'+
            '<envjs_1234567890 xmlns="envjs_1234567890">'
                +htmlstring+
            '</envjs_1234567890>'+
        '</body></html>';
        Envjs.parseHtmlDocument(docstring,tmpdoc, false, null,null);
        if(htmlstring.length > __cachable__ ){
            tmpdoc.normalizeDocument();
            __fragmentCache__[htmlstring] = tmpdoc;
            __fragmentCache__.length += htmlstring.length;
            tmpdoc.cached = true;
        }else{
            tmpdoc.cached = false;
        }
    }

    //parent is envjs_1234567890 element
    parent = tmpdoc.body.childNodes[0];
    while(element.firstChild != null){
        //zap the elements children so we can import
        element.removeChild( element.firstChild );
    }

    if(tmpdoc.cached){
        length = parent.childNodes.length;
        for(i=0;i<length;i++){
            importedNode = element.importNode( parent.childNodes[i], true );
            element.appendChild( importedNode );
        }
    }else{
        while(parent.firstChild != null){
            tmpNode  = parent.removeChild( parent.firstChild );
            importedNode = element.importNode( tmpNode, true);
            element.appendChild( importedNode );
        }
    }

    // console.log('finished fragment: %s', element.outerHTML);
    return element;
};

var __clearFragmentCache__ = function(){
    __fragmentCache__ = {};
}

